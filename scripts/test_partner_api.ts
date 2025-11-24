import fetch from 'node-fetch';

async function testPartnerApi() {
    const baseUrl = 'http://localhost:3000/api/partner';

    console.log('--- Testing Partner API Validation ---');

    // Test 1: Missing required fields (should fail)
    console.log('\nTest 1: Missing required fields');
    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                organisationName: 'Test Org',
                // Missing partnerType, geographicFocus, etc.
            }),
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        if (response.status === 400 && data.error === 'Validation failed') {
            console.log('✅ Passed: Correctly rejected missing fields');
        } else {
            console.log('❌ Failed: Did not reject missing fields as expected');
        }
    } catch (error) {
        console.error('Error:', error);
    }

    // Test 2: Invalid data types (should fail)
    console.log('\nTest 2: Invalid data types');
    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                organisationName: 'Test Org',
                partnerType: 'NGO',
                geographicFocus: 'Kenya', // Should be an array
                interestAreas: ['Health'],
                contactPerson: 'John Doe',
                workEmail: 'john@example.com',
            }),
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        if (response.status === 400 && data.error === 'Validation failed') {
            console.log('✅ Passed: Correctly rejected invalid data types');
        } else {
            console.log('❌ Failed: Did not reject invalid data types as expected');
        }
    } catch (error) {
        console.error('Error:', error);
    }

    // Test 3: Valid request (should succeed or fail with Notion error if config is missing, but pass validation)
    console.log('\nTest 3: Valid request');
    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                organisationName: 'Test Org',
                partnerType: 'NGO',
                geographicFocus: ['Kenya'],
                interestAreas: ['Health'],
                contactPerson: 'John Doe',
                workEmail: 'john@example.com',
                phone: '1234567890',
                website: 'https://example.com',
            }),
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.status === 200) {
            console.log('✅ Passed: Valid request accepted');
        } else if (response.status === 500 && (data.error === 'Notion configuration missing or invalid' || data.error === 'Failed to submit to Notion')) {
            console.log('✅ Passed: Validation passed (failed at Notion step as expected/allowed)');
        } else {
            console.log('❌ Failed: Unexpected response for valid request');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testPartnerApi();
