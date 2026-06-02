import { Section, Container } from "@/components/craft";
import { TopNav } from "@/components/top-nav";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | MossGame",
  description: "Privacy Policy for MossGame — Free Open Source Tools Directory",
};

export default async function PrivacyPolicy() {
  const t = await getTranslations("privacy");

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Section>
        <Container>
          <div className="mx-auto max-w-4xl space-y-8 py-12">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">{t("title")}</h1>
              <p className="text-muted-foreground">{t("lastUpdated")}</p>
              <p className="text-sm text-muted-foreground italic">{t("translationNotice")}</p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
              <section className="space-y-4"><h2 className="text-2xl font-semibold">{t("s1title")}</h2><p>{t("s1text")}</p><p>{t("s1text2")}</p></section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">{t("s2title")}</h2>
                <h3 className="text-xl font-semibold">{t("s2aTitle")}</h3>
                <p>{t("s2aText")}</p>
                <ul className="list-disc pl-6 space-y-2"><li>{t("s2aLi1")}</li><li>{t("s2aLi2")}</li><li>{t("s2aLi3")}</li><li>{t("s2aLi4")}</li></ul>
                <p>{t("s2aIncludes")}</p>
                <ul className="list-disc pl-6 space-y-2"><li>{t("s2aInc1")}</li><li>{t("s2aInc2")}</li><li>{t("s2aInc3")}</li></ul>
                <h3 className="text-xl font-semibold mt-4">{t("s2bTitle")}</h3>
                <p>{t("s2bText")}</p>
                <ul className="list-disc pl-6 space-y-2"><li>{t("s2bLi1")}</li><li>{t("s2bLi2")}</li><li>{t("s2bLi3")}</li><li>{t("s2bLi4")}</li><li>{t("s2bLi5")}</li><li>{t("s2bLi6")}</li></ul>
                <h3 className="text-xl font-semibold mt-4">{t("s2cTitle")}</h3>
                <p>{t("s2cText")}</p>
              </section>

              <section className="space-y-4"><h2 className="text-2xl font-semibold">{t("s3title")}</h2><p>{t("s3text")}</p><ul className="list-disc pl-6 space-y-2"><li>{t("s3li1")}</li><li>{t("s3li2")}</li><li>{t("s3li3")}</li><li>{t("s3li4")}</li><li>{t("s3li5")}</li><li>{t("s3li6")}</li><li>{t("s3li7")}</li><li>{t("s3li8")}</li></ul></section>

              <section className="space-y-4"><h2 className="text-2xl font-semibold">{t("s4title")}</h2><p>{t("s4text")}</p><ul className="list-disc pl-6 space-y-2"><li><strong>{t("s4li1Label")}:</strong> {t("s4li1")}</li><li><strong>{t("s4li2Label")}:</strong> {t("s4li2")}</li><li><strong>{t("s4li3Label")}:</strong> {t("s4li3")}</li><li><strong>{t("s4li4Label")}:</strong> {t("s4li4")}</li></ul>
                <p className="text-sm pt-4"><Link href="/legal" className="text-primary hover:underline">{t("licenseLink")} →</Link></p></section>

              <section className="space-y-4"><h2 className="text-2xl font-semibold">{t("s5title")}</h2><p>{t("s5text")}</p></section>
              <section className="space-y-4"><h2 className="text-2xl font-semibold">{t("s6title")}</h2><p>{t("s6text")}</p></section>
              <section className="space-y-4"><h2 className="text-2xl font-semibold">{t("s7title")}</h2><p>{t("s7text")}</p><ul className="list-disc pl-6 space-y-2"><li><strong>{t("s7li1Label")}:</strong> {t("s7li1")}</li><li><strong>{t("s7li2Label")}:</strong> {t("s7li2")}</li><li><strong>{t("s7li3Label")}:</strong> {t("s7li3")}</li><li><strong>{t("s7li4Label")}:</strong> {t("s7li4")}</li><li><strong>{t("s7li5Label")}:</strong> {t("s7li5")}</li><li><strong>{t("s7li6Label")}:</strong> {t("s7li6")}</li></ul><p>{t("s7text2")}</p></section>
              <section className="space-y-4"><h2 className="text-2xl font-semibold">{t("s8title")}</h2><p>{t("s8text")}</p></section>
              <section className="space-y-4"><h2 className="text-2xl font-semibold">{t("s9title")}</h2><p>{t("s9text")}</p></section>
              <section className="space-y-4"><h2 className="text-2xl font-semibold">{t("s10title")}</h2><p>{t("s10text")}</p></section>
              <section className="space-y-4"><h2 className="text-2xl font-semibold">{t("s11title")}</h2><p>{t("s11text")}</p></section>
              <section className="space-y-4"><h2 className="text-2xl font-semibold">{t("s12title")}</h2><p>{t("s12text")}</p></section>
              <section className="space-y-4"><h2 className="text-2xl font-semibold">{t("s13title")}</h2><p>{t("s13text")}</p></section>
              <section className="space-y-4"><h2 className="text-2xl font-semibold">{t("s14title")}</h2><p>{t("s14text")}</p></section>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}

