import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

const Privacy = () => (
  <div className="min-h-[calc(100vh-4rem)] xl:min-h-screen w-full bg-white dark:bg-black transition-colors">
    <div className="max-w-3xl mx-auto p-6 xl:p-8 space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Privacy</h1>
      <p>
        This is the privacy policy for Arcane City, which outlines how we handle
        your personal information. We are committed to protecting your privacy and
        ensuring that your personal data is processed in accordance with applicable
        laws and regulations.
      </p>
      <ol className="list-decimal list-outside pl-6 space-y-8">
        <li>
          <strong>General Policy</strong>
          <ul className="mt-2 space-y-2">
            <li>We respect your privacy and strive to keep your data safe and secure.</li>
            <li>We don't use your data for any purpose other than your use and interaction with this site.</li>
            <li>We don't share your data with any 3rd parties. Sensitive data such as passwords are encrypted and not available to users or administrators.</li>
            <li>We display no advertisements and share no data with advertisers.</li>
          </ul>
        </li>
        <li>
          <strong>Types and Purpose of Collected Information</strong>
          <ul className="mt-2 space-y-2">
            <li><strong>Personal information.</strong> Your name, email address, bio, event data and other information you provide when signing up or sharing event data via a form. This data is collected to identify you as a user of the app to administrators as well as other site users.</li>
            <li><strong>Settings and Account information.</strong> We store data such as your notification preferences, time zone, theme choice and other settings data you submit while using the site. This data is collected to improve the overall user experience and retain your preferences.</li>
          </ul>
        </li>
        <li>
          <strong>How you can request deletion of data</strong>
          <ul className="mt-2 space-y-2">
            <li>You can request the deletion of any or all of your data by emailing the administrator at <a className="underline hover:text-blue-600 dark:hover:text-blue-400" href="mailto:geoff.maddock@gmail.com">geoff.maddock@gmail.com</a> and they will follow up within two business days.</li>
          </ul>
        </li>
      </ol>
      <p>Direct any other questions to <a className="underline hover:text-blue-600 dark:hover:text-blue-400" href="mailto:geoff.maddock@gmail.com"><strong>geoff.maddock@gmail.com</strong></a></p>
    </div>
  </div>
);

export const PrivacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: Privacy
});
