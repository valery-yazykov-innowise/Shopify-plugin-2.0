let url = 'chocoala.staging.userwerk.com/uw.js';
let showPopup = 1;
let street = Shopify.checkout.billing_address.address1;
let money = new Intl.NumberFormat(Shopify.country.toLowerCase(), { style: 'currency', currency: Shopify.checkout.presentment_currency }).format(Shopify.checkout.total_price);

var _uw = _uw || {};

_uw.order_id = Shopify.checkout.order_id ?? '';
_uw.order_total = money.replace(/\s/g,'') ?? '';
_uw.order_items_categories = '';
_uw.order_voucher_code= Shopify.checkout.gift_cards[0] ?? '';
_uw.first_name = Shopify.checkout.billing_address.first_name ?? '';
_uw.last_name = Shopify.checkout.billing_address.last_name ?? '';
_uw.title = "Mr"; // There is Mr./Mrs. in default store theme so this set as default
_uw.postal_code = Shopify.checkout.billing_address.zip ?? '';
_uw.city = Shopify.checkout.billing_address.city ?? '';
_uw.street = street.substring(0, street.toLowerCase().indexOf('str.')).trim() ?? '';
_uw.house_number = '';
_uw.email = Shopify.checkout.email ?? '';
_uw.birthday = '';
_uw.combined_phone_number = Shopify.checkout.billing_address.phone ?? '';
_uw.country = Shopify.country ?? '';

setTimeout( () => {

    const loadScript = (FILE_URL, async = true, type = "text/javascript") => {
        return new Promise((resolve, reject) => {
            try {
                const scriptEle = document.createElement("script");
                scriptEle.type = type;
                scriptEle.async = async;
                scriptEle.src =FILE_URL;

                scriptEle.addEventListener("load", (ev) => {
                    resolve({ status: true });
                });

                scriptEle.addEventListener("error", (ev) => {
                    reject({
                        status: false,
                        message: `Failed to load the script ＄{FILE_URL}`
                    });
                });

                document.body.appendChild(scriptEle);
            } catch (error) {
                reject(error);
            }
        });
    };

    if (showPopup) {
        loadScript("https://" + url)
            .then( data  => {
                console.log("Script loaded successfully");
            })
            .catch( err => {
                console.error(err);
            });
    }

}, 0)
