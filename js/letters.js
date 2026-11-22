(function (global) {
  const ITEM_TYPES = [
    {
      id: "dismissed-bankruptcy",
      label: "Dismissed bankruptcy still reporting",
      evidence: [
        "Official credit report from AnnualCreditReport.com (save the PDF)",
        "Bankruptcy court dismissal order or official docket showing dismissal or discharge and dates",
        "IRS account transcripts (Get Transcript or Form 4506-T) if they help show a zero balance or that a bankruptcy-related tax entry was later removed",
      ],
      body: function (f) {
        return (
          "The item described above appears to be a bankruptcy that was dismissed or that is otherwise reporting inaccurately. " +
          "Under 15 U.S.C. § 1681c (FCRA section 605), a bankruptcy may generally be reported for no more than 10 years. " +
          "I request that you verify the status and dates of this item against the enclosed court records and delete or correct it if it is inaccurate, incomplete, unverifiable, or obsolete.\n\n" +
          extra(f)
        );
      },
    },
    {
      id: "not-mine",
      label: "Account that is not mine",
      evidence: [
        "Official credit report from AnnualCreditReport.com",
        "FTC IdentityTheft.gov report if this account is the result of identity theft (required for a § 605B block letter)",
        "Any police report you have, if one exists",
        "Proof of your identity and current address (copies only), as the bureau may request",
      ],
      body: function (f) {
        return (
          "This account is not mine. I did not open or authorize it. " +
          "Please investigate and delete this item if you cannot verify that it belongs to me.\n\n" +
          extra(f) +
          "\n\nA false identity-theft report is illegal. I am only asking you to treat this as identity theft if I have also completed the identity-theft block section below and have a genuine FTC IdentityTheft.gov report."
        );
      },
    },
    {
      id: "wrong-balance",
      label: "Wrong balance or payment status",
      evidence: [
        "Official credit report from AnnualCreditReport.com",
        "Creditor or servicer statements showing the correct balance or status",
        "Canceled checks, payment confirmations, or settlement letters, if you have them",
        "IRS transcripts if they are relevant to a tax-related balance",
      ],
      body: function (f) {
        return (
          "The balance, payment status, or related account information shown for this item is inaccurate. " +
          "Please investigate this item, compare it with the enclosed records, and correct or delete any information that is inaccurate, incomplete, or unverifiable.\n\n" +
          extra(f)
        );
      },
    },
    {
      id: "obsolete",
      label: "Too old to report (7-year or 10-year FCRA period)",
      evidence: [
        "Official credit report from AnnualCreditReport.com, including the date of the item",
        "Court order, charge-off letter, or other record that shows the date of the first delinquency, judgment, or bankruptcy entry",
        "IRS transcripts if they help establish dates or a zero balance",
      ],
      body: function (f) {
        return (
          "This adverse item appears to be older than the reporting period allowed by 15 U.S.C. § 1681c (FCRA section 605). " +
          "Most adverse information may be reported for no more than 7 years, and bankruptcies for no more than 10 years. " +
          "The statute of limitations for filing a lawsuit is a different legal deadline and does not, by itself, require an item to be removed from a credit report. " +
          "I request that you delete this item if it is obsolete under the FCRA reporting periods.\n\n" +
          extra(f)
        );
      },
    },
    {
      id: "other",
      label: "Other inaccurate or incomplete information",
      evidence: [
        "Official credit report from AnnualCreditReport.com",
        "Any documents that show the correct information (court records, creditor letters, IRS transcripts)",
      ],
      body: function (f) {
        return (
          "The information described above is inaccurate or incomplete. Please investigate this item and delete or correct any information that is inaccurate, incomplete, or unverifiable.\n\n" +
          extra(f)
        );
      },
    },
  ];

  function extra(f) {
    return f.explanation
      ? "Additional facts I want you to consider:\n" + f.explanation.trim()
      : "I have described the item as specifically as I can above. Please use the enclosed documents in your investigation.";
  }

  function personBlock(p) {
    const lines = [];
    lines.push(p.legalName || "[Your full legal name]");
    if (p.address1) lines.push(p.address1);
    else lines.push("[Street address]");
    if (p.address2) lines.push(p.address2);
    const cityLine = [p.city, p.state, p.zip].filter(Boolean).join(", ") || "[City, State ZIP]";
    lines.push(cityLine);
    if (p.phone) lines.push(p.phone);
    if (p.email) lines.push(p.email);
    return lines.join("\n");
  }

  function bureauAddress(org) {
    if (!org) return "[Bureau mailing address]";
    return (org.disputeMail || org.freezeMail || org.name).replace(/,\s*/g, "\n");
  }

  function buildLetter(opts) {
    const p = opts.profile || {};
    const org = opts.org;
    const type = ITEM_TYPES.find(function (t) { return t.id === opts.itemType; }) || ITEM_TYPES[ITEM_TYPES.length - 1];
    const date = UI.formatDate(opts.dateSent || UI.todayISO());
    const last4 = p.last4 ? "XXX-XX-" + p.last4 : "[Last four digits of SSN only, if you choose to include them — do not write a full SSN]";
    const account = opts.accountLast4
      ? "ending in " + opts.accountLast4
      : "[Last four of the account number from your credit report, if shown — do not write the full number]";

    const itemLines = [
      "Furnisher / creditor name: " + (opts.furnisher || "[Name as it appears on the credit report]"),
      "Account or item: " + account,
      "Type of item: " + type.label,
      opts.itemDate ? "Date related to the item (from the report or court record): " + opts.itemDate : null,
    ].filter(Boolean).join("\n");

    let letter =
      personBlock(p) + "\n\n" +
      date + "\n\n" +
      (org ? org.name : "[Credit bureau]") + "\n" +
      bureauAddress(org) + "\n\n" +
      "Re: Dispute of inaccurate information under the Fair Credit Reporting Act, 15 U.S.C. § 1681i (Section 611)\n\n" +
      "Dear Sir or Madam:\n\n" +
      "I am writing to dispute information on my credit report. I request that you investigate the item described below and delete or correct any information that is inaccurate, incomplete, or cannot be verified, as required by the Fair Credit Reporting Act.\n\n" +
      "My identifying information:\n" +
      "Name: " + (p.legalName || "[Your full legal name]") + "\n" +
      "Current address: " + ([p.address1, p.address2, p.city, p.state, p.zip].filter(Boolean).join(", ") || "[Your current address]") + "\n" +
      (p.dob ? "Date of birth: " + p.dob + "\n" : "") +
      "Social Security number (last four only): " + last4 + "\n\n" +
      "Item in dispute:\n" + itemLines + "\n\n" +
      type.body(opts) + "\n\n";

    if (opts.use605B) {
      letter +=
        "Request for an identity-theft block under 15 U.S.C. § 1681c-2 (FCRA Section 605B)\n\n" +
        "I also request that you block this information because it is the result of identity theft. " +
        "My Federal Trade Commission Identity Theft Report number, from IdentityTheft.gov, is: " +
        (opts.ftcNumber || "[FTC report number required]") + ".\n" +
        "I am enclosing a copy of that report. It is illegal to knowingly file a false identity-theft report. " +
        "I am making this block request only for an item that is not mine.\n\n";
    }

    letter +=
      "Please send me the written results of your investigation, including a copy of my updated credit report if any change is made. " +
      "Under 15 U.S.C. § 1681i, a consumer reporting agency generally must complete its investigation within 30 days of receiving a complete dispute. " +
      "That period may be extended by 15 days in limited circumstances if I provide additional information during the investigation. " +
      "The 30-day clock runs from the date the bureau receives the dispute, not necessarily the date I mail it.\n\n" +
      "I am enclosing copies (not originals) of supporting documents, as listed in my evidence checklist.\n\n" +
      "Sincerely,\n\n" +
      (p.legalName || "[Sign your name, then print your name]");

    return {
      text: letter,
      evidence: type.evidence,
      typeLabel: type.label,
    };
  }

  global.Letters = {
    ITEM_TYPES: ITEM_TYPES,
    buildLetter: buildLetter,
  };
})(window);
