
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="bg-background text-foreground">
      <header className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center border-b">
        <Logo />
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </header>
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>
          <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>
          
          <p>Your privacy is important to us. This Privacy Policy explains how CarSafe collects, uses, and shares your information. We are committed to protecting your personal information in compliance with laws like the Protection of Personal Information Act (POPIA).</p>

          <h2>1. What Information We Collect</h2>
          <ul>
            <li><strong>Account Information:</strong> Your email address and role (Owner, Dealer, etc.) when you create an account.</li>
            <li><strong>Vehicle Information:</strong> Details about your vehicle, including VIN, make, model, and year.</li>
            <li><strong>Service History:</strong> Records of services performed, including dates, costs, notes, and parts used. This data is added by verified dealers with your consent.</li>
            <li><strong>Consent Information:</strong> We keep a record of the sharing preferences you set within the app.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use your information for one primary purpose: to provide and improve the CarSafe service. This includes:</p>
          <ul>
            <li>Displaying your vehicle's service history to you.</li>
            <li>Powering the AI tools to give you recommendations and insights.</li>
            <li>Allowing you to share your vehicle's data with other users based on the consents you provide.</li>
          </ul>

          <h2>3. Data Sharing and Your Consent (POPIA Compliance)</h2>
          <p><strong>You are in control of your data.</strong> We will only share your vehicle's information with other parties based on your explicit consent, which you can manage at any time in the app's "Sharing & Consent" settings.</p>
          <ul>
            <li><strong>With Service Dealers:</strong> If you grant consent, an authorized dealer can view your vehicle's history and add new service records. This is necessary to maintain a verified history.</li>
            <li><strong>With Resellers:</strong> If you grant consent, an approved reseller can view vehicle details, but only when you have marked the vehicle as "for_sale".</li>
            <li><strong>With Insurance Partners:</strong> If you grant consent, an approved insurance agent can view vehicle details and history, but only when the vehicle is actively in an insurance claim (`in_claim` status). This access is for the specific purpose of processing the claim.</li>
          </ul>
          <p>We use technical measures (like Firestore Security Rules) to enforce these consent-based restrictions.</p>

          <h2>4. Data Security</h2>
          <p>We implement security safeguards, including encryption and strict access controls, to protect your information from unauthorized access.</p>

          <h2>5. Your Rights</h2>
          <p>You have the right to access and view the information we hold about you. The CarSafe app is designed to give you full transparency and control over your vehicle's data and your sharing preferences.</p>

          <h2>6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, you can contact us by email: support@carsafe.app</p>
        </div>
      </main>
    </div>
  );
}
