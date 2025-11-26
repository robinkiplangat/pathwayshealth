import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
                <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-green max-w-none text-gray-700 space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                        <p>
                            Welcome to Pathways Health ("Pathways"), an initiative by Fourbic. By accessing our website at <Link href="/" className="text-green-700 hover:underline">pathways.fourbic.com</Link>, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Use License</h2>
                        <p>
                            Permission is granted to temporarily download one copy of the materials (information or software) on Pathways' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>modify or copy the materials;</li>
                            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                            <li>attempt to decompile or reverse engineer any software contained on Pathways' website;</li>
                            <li>remove any copyright or other proprietary notations from the materials; or</li>
                            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                        </ul>
                        <p className="mt-2">
                            This license shall automatically terminate if you violate any of these restrictions and may be terminated by Fourbic at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Disclaimer</h2>
                        <p>
                            The materials on Pathways' website, including the climate resilience assessment and generated action plans, are provided on an 'as is' basis for informational purposes only. They do not constitute professional engineering, medical, legal, or climate adaptation advice.
                        </p>
                        <p className="mt-2">
                            Fourbic makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                        <p className="mt-2">
                            Further, Fourbic does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site. You should consult with qualified professionals before making significant infrastructure or operational changes based on the information provided.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Limitations</h2>
                        <p>
                            In no event shall Fourbic or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Pathways' website, even if Fourbic or a Fourbic authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Accuracy of Materials</h2>
                        <p>
                            The materials appearing on Pathways' website could include technical, typographical, or photographic errors. Fourbic does not warrant that any of the materials on its website are accurate, complete or current. Fourbic may make changes to the materials contained on its website at any time without notice. However, Fourbic does not make any commitment to update the materials.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Links</h2>
                        <p>
                            Fourbic has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Fourbic of the site. Use of any such linked website is at the user's own risk.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Modifications</h2>
                        <p>
                            Fourbic may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Governing Law</h2>
                        <p>
                            These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Fourbic is established, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at:
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
