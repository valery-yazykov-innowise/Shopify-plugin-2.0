import { useCallback, useEffect, useState } from "react";
import {
    Card,
    TextContainer,
    TextField,
    ChoiceList,
    Modal,
    FooterHelp,
    Link
} from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function ScriptTagCard() {
    const emptyToastProps = { content: null };
    const [isLoading, setIsLoading] = useState(true);
    const [toastProps, setToastProps] = useState(emptyToastProps);
    const [script, setScript] = useState("");
    const [selected, setSelected] = useState("");
    const fetch = useAuthenticatedFetch();
    const [active, setActive] = useState(false);

    const handleChange = useCallback(() => setActive(!active), [active]);

    const handleScriptTextChange = useCallback((value) => setScript(value), []);
    const handleOptionChange = useCallback((value) => setSelected(value), []);

    const { data, isLoading: isLoadingCount } = useAppQuery({
        url: "/api/script/data",
        reactQueryOptions: {
            onSuccess: () => {
                setIsLoading(false);
            }
        }
    });

    useEffect(() => {
        dataRep();
    }, [data]);

    function dataRep() {
        setSelected((data?.status === 1 ? "1" : "0") ?? "0");
        setScript(data?.script_link ?? "");
    }

    const toastMarkup = toastProps.content && (
        <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)}/>
    );

    const handlePopulate = async () => {
        setIsLoading(true);
        const response = await fetch("/api/script/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify({ script: script, status: selected })
        });

        if (response.ok) {
            if (selected == '1') {
                setToastProps({ content: "Congratulations, userwerk is all set!" });
            } else {
                setToastProps({ content: "Integration disabled" });
            }
            setIsLoading(false);
        } else {
            setIsLoading(false);
            setToastProps({
                content: "There was an error adding script tag",
                error: true
            });
        }
    };

    return (
        <>
            {toastMarkup}
            <Card
                title="Userwerk Integration"
                sectioned
                primaryFooterAction={{
                    content: "Connect",
                    onAction: handlePopulate,
                    loading: isLoading
                }}
                secondaryFooterActions={[
                    {
                        content: "How to use",
                        onAction: handleChange
                    }
                ]}
            >
                <TextContainer spacing="loose">
                    <p>
                        This application allows you to connect additional scripts to your store after payment.
                        To connect a script to your store you must enter the link to your script below
                    </p>
                    <TextField
                        value={script}
                        onChange={handleScriptTextChange}
                        autoComplete="script"
                        label="Please enter your site key or contact hello@userwerk.com, to receive one"
                        type="script"
                        placeholder={'Name'}
                        helpText={
                            <span>
              The integration will be shown after successful payment for the order in your store
            </span>
                        }
                    />
                    <ChoiceList
                        title="Enable integration"
                        choices={[
                            { label: "Yes", value: "1" },
                            { label: "No", value: "0" }
                        ]}
                        selected={selected}
                        onChange={handleOptionChange}
                    />
                </TextContainer>
            </Card>
            <Modal
                open={active}
                onClose={handleChange}
                title="How to use Userwerk Application?"
                primaryAction={{
                    content: "Go back",
                    onAction: handleChange
                }}
            >
                <Modal.Section>
                    <TextContainer>
                        <p>
                            This app allows you to embed a script tag on a "thank you" page.
                            To do this, you need to enter a link to your ready-made javascript file.
                            After that you need to set the visibility of the file (yes/no).
                            After connecting the script via the "Connect" button you will see the result on the page
                            after paying for the product.
                        </p>
                        <p>
                            Once the app is removed from your store, the settings will be reset, all script tags will be
                            lost and deleted from your store.
                            You will also be able to reinstall the application and use it again, but with new settings.
                        </p>
                        <p>
                            If you notice that for some reason your script tag does not work, you can email us:
                            <Link url="mailto: shopifysupport@userwerk.com">
                                <b>
                                    shopifysupport@userwerk.com
                                </b>
                            </Link>
                        </p>
                    </TextContainer>
                </Modal.Section>
            </Modal>
            <FooterHelp>
                Learn more about{" "}
                <Link external="true" url="/documents/privacy-policy.pdf">
                    privacy policy
                </Link>
            </FooterHelp>
        </>
    );
}
