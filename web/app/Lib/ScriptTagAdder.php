<?php

declare(strict_types=1);

namespace App\Lib;

use Illuminate\Support\Facades\Log;
use Shopify\Auth\Session;
use Shopify\Clients\Rest;
use App\Models\ScriptTag as ScriptTagModel;

class ScriptTagAdder
{
    protected const PATH_TO_SCRIPT_DIR = '/public/';
    protected const PATH_TO_START_JS_FILE = 'js/startScript.js';
    protected const PATH_TO_MAIN_JS_FILE = 'js/';

    public static function call(Session $session, string $scriptLink, $scriptStatus): void
    {
        if (count(ScriptTagModel::where('script_tags.shop', $session->getShop())->get()) === 0) {
            self::generateScriptFile($session, $scriptLink, $scriptStatus[0]);
        } else {
            self::updateScriptTagRecord($session, $scriptLink, $scriptStatus[0]);
        }
    }

    public static function generateScriptFile(Session $session, string $scriptLink, string $scriptStatus): void
    {
        $scriptJsName = self::PATH_TO_MAIN_JS_FILE . 'scriptTag-' . time() . '.js';
        $fromFilename = dirname(__DIR__, 2) . self::PATH_TO_SCRIPT_DIR . self::PATH_TO_START_JS_FILE;
        $toFilename = dirname(__DIR__, 2) . self::PATH_TO_SCRIPT_DIR . $scriptJsName;
        if (!copy($fromFilename, $toFilename)) {
            Log::error('error with copying file');
        } else {
            self::updateJsSettings($scriptJsName, $scriptLink, $scriptStatus);
            self::createScriptTag($session, $scriptJsName);
            self::createScriptTagRecord($session, $scriptLink, $scriptJsName, $scriptStatus);
        }
    }

    public static function updateScriptTagRecord(Session $session, string $scriptLink, string $scriptStatus): void
    {
        $scriptRecord = ScriptTagModel::where('script_tags.shop', $session->getShop());
        $scriptRecord->update([
            'script_link' => $scriptLink,
            'status' => $scriptStatus
        ]);

        self::updateJsSettings($scriptRecord->value('script_file'), $scriptLink, $scriptStatus);
    }

    public static function createScriptTag(Session $session, string $scriptName): void
    {
        $client = new Rest($session->getShop(), $session->getAccessToken());

        $client->post('script_tags', [
            "script_tag" => [
                "event" => "onload",
                "display_scope" => "order_status",
                "src" => $_ENV['APP_URL'] . '/' . $scriptName,
            ],
        ]);
    }

    public static function createScriptTagRecord(Session $session, string $scriptLink, string $scriptJsName, string $scriptStatus): void
    {
        $shop = ['shop' => $session->getShop(),
            'script_file' => $scriptJsName,
            'script_link' => $scriptLink,
            'status' => $scriptStatus,
            'created_at' => date("Y-m-d H:i:s")
        ];

        ScriptTagModel::where('script_tags')->insert($shop);
    }

    public static function updateJsSettings(string $scriptJsName, string $scriptLink, string $scriptStatus): void
    {
        $script = file_get_contents($scriptJsName);
        $data = explode(';', $script, 3);
        $data[0] = sprintf("let url = '%s'", $scriptLink . '.' . $_ENV['SITE_URL']);
        $data[1] = sprintf("\r\nlet showPopup = %d", $scriptStatus);
        $newScript = implode(";", $data);

        file_put_contents($scriptJsName, $newScript);
    }
}
