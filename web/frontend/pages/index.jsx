import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import { trophyImage } from "../assets";

import { ScriptTagCard } from "../components";

export default function HomePage() {
  return (
    <Page narrowWidth>
      <TitleBar title="Userwerk" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <ScriptTagCard />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
