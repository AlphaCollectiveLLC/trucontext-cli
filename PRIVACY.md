# TruContext Privacy Policy

**Effective Date:** March 22, 2026
**Last Updated:** March 22, 2026

Alpha Collective LLC ("Company," "we," "us," or "our") operates the TruContext platform, APIs, CLI tools, and related services (collectively, the "Service"). This Privacy Policy describes how we collect, use, and protect information when you use the Service.

## 1. Information We Collect

### Account Information
When you create an account, we collect:
- Email address (via OAuth through AWS Cognito)
- Authentication tokens (stored locally on your device, not on our servers)

We do not collect passwords. Authentication is handled entirely through OAuth providers (Google, email-based magic links).

### Your Data (User Content)
When you use the Service, you may ingest, store, and process:
- Text content, documents, images, audio, and other files
- Entities, relationships, and structural data
- Metadata you provide (author hints, source medium, filenames)
- Confidence scores, temporal flags, and context relationships

**You own Your Data.** See Section 2.

### Usage Data
We automatically collect:
- API request logs (endpoint, method, timestamp, response status)
- Error logs for debugging and service reliability
- Aggregate usage metrics (ingest volume, query count, API key usage)

We do not collect or log the content of your API requests or responses in our usage analytics.

### Device and CLI Information
The CLI tool stores authentication tokens locally at `~/.trucontext/credentials.json` with restricted file permissions (readable only by your user account). We do not collect device identifiers, IP addresses for tracking purposes, or telemetry from the CLI tool.

## 2. How We Use Your Data

### Your Content
- **To provide the Service:** We process your content through our AI pipeline (extraction, classification, enrichment) solely to operate the features you use.
- **Within your tenant only:** Your Data is isolated to your tenant. Other users cannot access it. Our systems enforce tenant isolation at every layer.
- **Not for training:** We do not use Your Data to train, fine-tune, or improve machine learning models — ours or anyone else's — unless you provide separate, explicit written consent.
- **Not for sale:** We do not sell, rent, or share Your Data with third parties for their commercial purposes.

### Account Information
- To authenticate your access to the Service
- To communicate with you about your account, service updates, and security notices

### Usage Data
- To monitor and improve Service reliability and performance
- To detect and prevent abuse, fraud, and security threats
- To generate aggregate, anonymized statistics about Service usage (which cannot be used to identify you or your content)

## 3. Third-Party Services

We use the following third-party services to operate the platform:

| Service | Purpose | Data Shared |
|---------|---------|-------------|
| **AWS** (DynamoDB, S3, Lambda, Cognito) | Infrastructure and authentication | Your Data is stored and processed in AWS US regions |
| **Neo4j Aura** | Graph database | Your Data is stored in the intelligent knowledge graph |
| **Anthropic** (Claude API) | AI processing pipeline | Content you ingest is sent to Claude for extraction and classification |
| **Google AI** (Gemini API) | Alternative AI processing | Content may be sent to Gemini if configured by admin |
| **Stripe** | Payment processing | Email and billing information for paid plans |

When your content is processed by AI providers (Anthropic, Google), it is sent via their APIs under their respective data processing terms. These providers have committed to not training on API inputs. We select providers whose data practices align with our commitment to your privacy.

## 4. Data Retention

- **Your Data:** Retained as long as your account is active. Upon account termination, you may request data export within 30 days. After 30 days, Your Data may be permanently deleted.
- **Heartbeat events:** Automatically expire after 30 days (TTL).
- **Heartbeat thoughts:** Automatically expire after 90 days (TTL).
- **Usage logs:** Retained for up to 12 months for operational purposes, then deleted.
- **Account information:** Retained until you delete your account.

## 5. Data Security

We implement industry-standard security measures:

- **Encryption at rest:** All data stored in DynamoDB, S3, and Neo4j is encrypted.
- **Encryption in transit:** All API communication uses TLS/HTTPS.
- **Tenant isolation:** Every database query is scoped to your tenant ID. Cross-tenant access is architecturally prevented.
- **API key security:** API keys are managed through AWS API Gateway with usage plans and throttling.
- **Authentication:** OAuth 2.0 with PKCE flow. No passwords stored.
- **Access control:** Role-based access with system admin separation.
- **Local credential security:** CLI tokens stored with 600 file permissions (user-read-only).

## 6. Your Rights

You have the right to:

- **Access** your data at any time through the API, CLI, or dashboard.
- **Export** your data in structured format upon request.
- **Delete** your data by deleting entities, content, or your entire account.
- **Correct** your data by updating entities and ingesting corrections.
- **Object** to specific processing by contacting us.
- **Withdraw consent** for any optional processing at any time.

For data subject requests, contact us at privacy@alphacollective.com.

## 7. Children's Privacy

The Service is not directed to individuals under 16. We do not knowingly collect information from children under 16. If you become aware that a child has provided us with personal information, please contact us and we will take steps to delete such information.

## 8. International Data Transfers

Your Data is processed and stored in the United States (AWS US-East-1 region). If you are located outside the United States, your data will be transferred to and processed in the United States. By using the Service, you consent to this transfer.

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of material changes via email or through the Service. Your continued use of the Service after changes take effect constitutes acceptance of the updated policy.

## 10. Contact

For privacy-related questions or data subject requests:

**Alpha Collective LLC**
Email: privacy@alphacollective.com
Website: https://trucontext.ai
