-- Storefront content: panel-managed labels, header/footer URLs, newsletter, forms

ALTER TABLE "HeaderSetting" ADD COLUMN "accountUrl" TEXT;
ALTER TABLE "HeaderSetting" ADD COLUMN "searchPlaceholder" TEXT;
ALTER TABLE "HeaderSetting" ADD COLUMN "cartUrl" TEXT;

ALTER TABLE "FooterSetting" ADD COLUMN "newsletterTitle" TEXT;
ALTER TABLE "FooterSetting" ADD COLUMN "newsletterDescription" TEXT;
ALTER TABLE "FooterSetting" ADD COLUMN "newsletterPlaceholder" TEXT;
ALTER TABLE "FooterSetting" ADD COLUMN "newsletterButtonLabel" TEXT;
ALTER TABLE "FooterSetting" ADD COLUMN "newsletterSuccessMessage" TEXT;

ALTER TABLE "FormDefinition" ADD COLUMN "successMessage" TEXT;
ALTER TABLE "FormDefinition" ADD COLUMN "submitButtonLabel" TEXT;

ALTER TABLE "SiteSetting" ADD COLUMN "storefrontUi" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "CompanySetting" ADD COLUMN "contactFormKey" TEXT;
ALTER TABLE "CompanySetting" ADD COLUMN "contactLabels" JSONB NOT NULL DEFAULT '{}';

CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
