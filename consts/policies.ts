export type PolicySection = {
  title: string;
  content: string[];
};

export const privacyPolicy: PolicySection[] = [
  {
    title: 'Introduction',
    content: [
      'Welcome to our Fashion App. We are committed to protecting your privacy and ensuring you have a positive experience on our app. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.',
      'Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.',
    ],
  },
  {
    title: 'Information We Collect',
    content: [
      'We collect information that you provide directly to us, including:',
      '• Account information: username, email address, password, and profile information',
      '• User-generated content: photos, outfits, comments, ratings, and other content you create or share',
      '• Profile information: bio, preferences, and settings',
      '• Communication data: messages and interactions with other users',
      'We also automatically collect certain information when you use our app:',
      '• Device information: device type, operating system, unique device identifiers',
      '• Usage data: how you interact with the app, features you use, time spent',
      '• Location data: if you grant permission, we may collect location information',
      '• Analytics data: app crashes, performance metrics, and technical logs',
    ],
  },
  {
    title: 'How We Use Your Information',
    content: [
      'We use the information we collect to:',
      '• Provide, maintain, and improve our services',
      '• Create and manage your account',
      '• Enable social features like following, commenting, and sharing',
      '• Personalize your experience and show relevant content',
      '• Communicate with you about your account and our services',
      '• Detect, prevent, and address technical issues and security threats',
      '• Comply with legal obligations and enforce our terms of service',
      '• Conduct analytics and research to improve our app',
    ],
  },
  {
    title: 'Data Sharing and Disclosure',
    content: [
      'We may share your information in the following circumstances:',
      '• Public profile: Your username, profile picture, and public content are visible to other users',
      '• Service providers: We may share data with third-party service providers who perform services on our behalf',
      '• Legal requirements: We may disclose information if required by law or to protect our rights',
      '• Business transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred',
      '• With your consent: We may share information for any other purpose disclosed to you with your consent',
      'We do not sell your personal information to third parties.',
    ],
  },
  {
    title: 'Data Storage and Security',
    content: [
      'We implement appropriate technical and organizational measures to protect your personal information:',
      '• Encryption: We use encryption to protect data in transit and at rest',
      '• Access controls: We limit access to personal information to authorized personnel only',
      '• Regular security assessments: We conduct regular security audits and assessments',
      '• Secure infrastructure: We use reputable cloud service providers with strong security practices',
      'However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.',
    ],
  },
  {
    title: 'Your Rights and Choices',
    content: [
      'You have the following rights regarding your personal information:',
      '• Access: You can access and review your personal information through your account settings',
      '• Correction: You can update or correct your information at any time',
      '• Deletion: You can request deletion of your account and associated data',
      '• Data portability: You can request a copy of your data in a portable format',
      '• Opt-out: You can opt out of certain data collection and processing activities',
      '• Account settings: You can manage your privacy settings and preferences in the app',
      'To exercise these rights, please contact us using the information provided below.',
    ],
  },
  {
    title: 'Children\'s Privacy',
    content: [
      'Our app is not intended for children under the age of 13 (or the minimum age in your jurisdiction). We do not knowingly collect personal information from children under 13.',
      'If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly.',
    ],
  },
  {
    title: 'International Data Transfers',
    content: [
      'Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country.',
      'By using our app, you consent to the transfer of your information to these countries. We take appropriate measures to ensure your information receives an adequate level of protection.',
    ],
  },
  {
    title: 'Data Retention',
    content: [
      'We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law.',
      'When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal, regulatory, or legitimate business purposes.',
    ],
  },
  {
    title: 'Changes to This Privacy Policy',
    content: [
      'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.',
      'You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.',
    ],
  },
  {
    title: 'Contact Us',
    content: [
      'If you have any questions about this Privacy Policy or our data practices, please contact us at:',
      'Email: privacy@fashionapp.com',
      'We will respond to your inquiry within a reasonable timeframe.',
    ],
  },
  {
    title: 'Last Updated',
    content: [
      'This Privacy Policy was last updated on: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    ],
  },
];
