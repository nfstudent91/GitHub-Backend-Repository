
const http = require('http');
// Mock file upload content
const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const fileContent = 'Test file content';
const filename = 'test-doc.txt';

let TOKEN = '';

function request(method, path, body = null, isMultipart = false) {
    return new Promise((resolve, reject) => {
        let headers = {
            'Content-Type': 'application/json',
        };

        let postData = '';

        if (isMultipart) {
            headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
            postData =
                `--${boundary}\r
Content-Disposition: form-data; name="leadId"\r
\r
${body.leadId}\r
--${boundary}\r
Content-Disposition: form-data; name="file"; filename="${filename}"\r
Content-Type: text/plain\r
\r
${fileContent}\r
--${boundary}--`;
        } else if (body) {
            postData = JSON.stringify(body);
            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] = Buffer.byteLength(postData);
        }

        if (TOKEN) {
            headers['Authorization'] = `Bearer ${TOKEN}`;
        }

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: headers,
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    if (res.statusCode >= 400 && path !== '/api/auth/login') {
                        console.error(`Error Body [${method} ${path}]: ${data}`);
                    }
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error('JSON Parse Error:', data);
                    resolve(data);
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function runTest() {
    const API_PREFIX = '/api';

    try {
        // 0. Login
        console.log('0. Logging in...');
        // Ensure body is correct for login
        const loginRes = await request('POST', `${API_PREFIX}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });

        if (!loginRes.success) {
            throw new Error('Login failed: ' + JSON.stringify(loginRes));
        }
        TOKEN = loginRes.data.token;
        console.log('Logged in successfully.');

        // 1. Get First Lead
        console.log('1. Fetching Leads...');
        const leadsRes = await request('GET', `${API_PREFIX}/leads`);
        const lead = leadsRes.data && leadsRes.data[0];
        if (!lead) throw new Error('No leads found or failed to fetch leads');
        console.log(`Using Lead ID: ${lead.id}`);

        // 2. Upload Document
        console.log('2. Uploading Document...');
        const uploadRes = await request('POST', `${API_PREFIX}/documents/upload`, { leadId: lead.id }, true);

        if (!uploadRes.success) {
            console.error('Upload Failed:', uploadRes);
        } else {
            console.log('Document Uploaded:', uploadRes.data.id, uploadRes.data.filename);

            // 3. List Documents
            console.log('3. Listing Documents...');
            const listRes = await request('GET', `${API_PREFIX}/documents/lead/${lead.id}`);
            console.log(`Found ${listRes.count} documents.`);

            // 4. Update Document Metadata (PUT)
            console.log('4. Updating Document (PUT)...');
            // Note: Our API controller for PUT /:id uses upload.single("file").
            // If we send JSON, we need to ensure we don't send multipart header or construct multipart with just fields?
            // Express/Multer might handle mixed or just JSON if no file field is expected?
            // Actually, if we use upload.single(), it parses multipart. If we send JSON, it might skip body parsing unless we have bodyParser.json() before it?
            // Usually body-parser/express.json() is global.
            // Let's try sending JSON for metadata update.
            const updateRes = await request('PUT', `${API_PREFIX}/documents/${uploadRes.data.id}`, { originalName: 'updated-name.txt' });
            console.log('Update Result:', updateRes.success ? 'Success' : 'Failed', updateRes.message);

            // 5. Delete Document
            console.log('5. Deleting Document...');
            const deleteRes = await request('DELETE', `${API_PREFIX}/documents/${uploadRes.data.id}`);
            console.log('Delete Result:', deleteRes.success ? 'Success' : 'Failed');
        }

    } catch (error) {
        console.error('Test Failed:', error.message || error);
    }
}

runTest();
