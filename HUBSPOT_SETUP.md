# HubSpot Integration Setup Guide

This guide walks you through setting up the HubSpot integration for the QDS TCR ROI Calculator.

## Overview

The calculator uses two HubSpot integrations:

1. **Forms API** - Captures lead information when users complete the calculator
2. **Private App API** - Uploads PDF reports and attaches them to contact records

---

## Part 1: Forms API Setup (Already Done)

You already have these credentials:
- **Portal ID**: `360991`
- **Form GUID**: `b137e6ef-6681-46e6-acd4-b421bb0c28fe`

### Field Mapping

The calculator maps fields to HubSpot as follows:

| Calculator Field | HubSpot Field | Notes |
|-----------------|---------------|-------|
| **Branch Name** | `company` | Uses HubSpot's standard Company Name field |
| **Institution Name** | `institution_name` | Custom property (see below) |

### Custom Properties to Create

In HubSpot, go to **Settings → Properties → Contact Properties** and create these:

| Property Name | Label | Type |
|--------------|-------|------|
| `institution_name` | Institution Name | Single-line text |
| `monthly_transactions` | Monthly Transactions | Number |
| `current_ftes` | Current FTEs | Number |
| `annual_fte_cost` | Annual FTE Cost | Number |
| `estimated_roi` | Estimated Annual ROI | Number |
| `five_year_roi` | 5-Year ROI | Number |
| `fte_savings` | FTE Savings | Number |
| `payback_period_months` | Payback Period (Months) | Number |
| `has_positive_roi` | Has Positive ROI | Single checkbox |
| `pain_points` | Pain Points | Multi-line text |
| `pain_point_count` | Number of Pain Points | Number |

---

## Part 2: Private App Setup (For PDF Attachments)

To attach PDF reports to contact records, you need a HubSpot Private App.

### Step 1: Create the Private App

1. Go to **Settings** (gear icon) → **Integrations** → **Private Apps**
2. Click **Create a private app**
3. Fill in the basic info:
   - **Name**: `QDS ROI Calculator`
   - **Description**: `Uploads ROI calculator PDF reports and attaches to contacts`
   - **Logo**: Upload the QDS logo (optional)

### Step 2: Configure Scopes

Click on the **Scopes** tab and enable these permissions:

#### CRM Scopes
| Scope | Access Level | Purpose |
|-------|-------------|---------|
| `crm.objects.contacts.read` | Read | Find contacts by email |
| `crm.objects.contacts.write` | Write | Update contact properties |
| `crm.objects.companies.read` | Read | Associate with companies |
| `crm.objects.companies.write` | Write | Update company records |

#### Files Scopes
| Scope | Access Level | Purpose |
|-------|-------------|---------|
| `files` | Read & Write | Upload PDF reports |

#### Sales Scopes
| Scope | Access Level | Purpose |
|-------|-------------|---------|
| `sales-email-read` | Read | Create notes/engagements |

### Step 3: Create the App

1. Click **Create app**
2. Review the information and confirm
3. Copy the **Access Token** that appears
   - It looks like: `pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Save this securely** - you won't see it again!

### Step 4: Add Token to Environment

Add to your `.env.local` file (create if doesn't exist):

```
HUBSPOT_ACCESS_TOKEN=pat-na1-your-actual-token-here
```

For Vercel deployment, add this in:
**Project Settings → Environment Variables**

---

## Part 3: Testing the Integration

### Test Form Submission

1. Run the calculator locally: `npm run dev`
2. Complete all steps with test data
3. Submit the form
4. Check HubSpot Contacts for the new record

### Test PDF Upload

1. After the calculator shows results
2. Click "Download PDF"
3. Check HubSpot:
   - Go to the contact record
   - Look in the **Activity** tab
   - The PDF should appear as a note with attachment

---

## Troubleshooting

### "HubSpot not configured" message

- Verify `HUBSPOT_PORTAL_ID` and `HUBSPOT_FORM_GUID` are set
- Check for typos in environment variables
- Restart the dev server after adding env vars

### PDF not uploading to HubSpot

- Verify `HUBSPOT_ACCESS_TOKEN` is set correctly
- Check the Private App has all required scopes
- Look at server logs for specific error messages

### Contact not found for PDF attachment

The system needs to find the contact by email. Make sure:
- The contact was created via the form submission
- The email address matches exactly

### Rate Limits

HubSpot has API rate limits:
- 100 requests per 10 seconds for Private Apps
- The calculator should stay well within these limits

---

## Security Notes

1. **Never commit** `.env.local` to git (it's in `.gitignore`)
2. **Rotate tokens** if you suspect they're compromised
3. **Use Vercel environment variables** for production
4. The Private App token has limited scopes - only what's needed

---

## Support

For HubSpot API issues:
- [HubSpot Developer Docs](https://developers.hubspot.com/docs/api/overview)
- [Private Apps Guide](https://developers.hubspot.com/docs/api/private-apps)

For QDS Calculator issues:
- Contact the development team
