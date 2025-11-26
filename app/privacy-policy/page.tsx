import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-green max-w-none text-gray-700 space-y-6">
                    <section>
                        <p>
                            Pathways Health ("Pathways", "we", "us", or "our"), an initiative by Fourbic, operates the website <Link href="/" className="text-green-700 hover:underline">pathways.fourbic.com</Link>. We are committed to protecting your privacy and ensuring you have a positive experience on our website.
                        </p>
                        <p className="mt-2">
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
                        <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.</li>
                            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Use of Your Information</h2>
                        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Create and manage your account.</li>
                            <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
                            <li>Email you regarding your account or order.</li>
                            <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                            <li>Generate a personal profile about you to make future visits to the Site more personalized.</li>
                            <li>Increase the efficiency and operation of the Site.</li>
                            <li>Respond to product and customer service requests.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Disclosure of Your Information</h2>
                        <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. GDPR Compliance (European Union)</h2>
                        <p>
                            If you are a resident of the European Economic Area (EEA), you have certain data protection rights. Fourbic aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
                        </p>
                        <p className="mt-2">Your rights include:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>The right to access, update or to delete</strong> the information we have on you.</li>
                            <li><strong>The right of rectification.</strong> You have the right to have your information rectified if that information is inaccurate or incomplete.</li>
                            <li><strong>The right to object.</strong> You have the right to object to our processing of your Personal Data.</li>
                            <li><strong>The right of restriction.</strong> You have the right to request that we restrict the processing of your personal information.</li>
                            <li><strong>The right to data portability.</strong> You have the right to be provided with a copy of the information we have on you in a structured, machine-readable and commonly used format.</li>
                            <li><strong>The right to withdraw consent.</strong> You also have the right to withdraw your consent at any time where Fourbic relied on your consent to process your personal information.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. CCPA Compliance (United States)</h2>
                        <p>
                            Under the California Consumer Privacy Act (CCPA) and other state privacy laws, US residents may have specific rights regarding their personal information, including:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>The right to know what personal information is being collected about them.</li>
                            <li>The right to know whether their personal information is sold or disclosed and to whom.</li>
                            <li>The right to say no to the sale of personal information.</li>
                            <li>The right to access their personal information.</li>
                            <li>The right to equal service and price, even if they exercise their privacy rights.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Privacy Act (Australia & New Zealand)</h2>
                        <p>
                            We adhere to the Australian Privacy Principles (APPs) contained in the Privacy Act 1988 (Cth) and the Information Privacy Principles (IPPs) under the Privacy Act 2020 (NZ).
                        </p>
                        <p className="mt-2">
                            We will only collect personal information that is reasonably necessary for our functions or activities. We will take reasonable steps to ensure that the personal information we collect, use or disclose is accurate, complete and up-to-date. You have the right to request access to your personal information and to request its correction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
                        <p>
                            If you have questions or comments about this Privacy Policy, please contact us at:
                        </p>
                        <p className="mt-2 font-medium">
                            <a href="mailto:compliance@fourbic.com" className="text-green-700 hover:underline">compliance@fourbic.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
