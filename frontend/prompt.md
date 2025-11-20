Frontend Design & UX Improvements

Review Target: Data Scientist Profile Page

This document outlines potential improvements for the user profile interface, focusing on Visual Hierarchy, User Experience (UX), and Accessibility.

1. Visual Hierarchy & Layout

Avatar & Identity

Current: Generic "DA" initials in a green circle.

Suggestion: Implement Blockies or Jazzicons (generative pixel art based on the wallet address).

Why: This is a standard pattern in Web3 (e.g., OpenSea, Etherscan) that makes a wallet address feel like a unique identity without requiring a custom upload.

Bio Readability

Current: The biography text spans the full width of the container.

Suggestion: Limit the text container's max-width (e.g., to 60ch or 600px).

Why: Long lines of text cause eye fatigue. A narrower column is easier to scan and read.

Social Links Grouping

Current: Social links are inline with the "Joined" date.

Suggestion: Visually separate metadata ("Joined Jan 2024") from interactive links.

Action: Move "Joined Date" below the username/wallet address, and keep the social links (Twitter, GitHub, Website) in their current row but with increased spacing.

2. UX & Interaction Enhancements

Wallet Address Utility

Current: Static text display of the truncated address (0x18f9...).

Suggestion: Add a Copy-to-Clipboard icon button next to the address.

Interaction: On click, the icon should briefly change to a checkmark or display a "Copied!" tooltip.

Why: Copying addresses is the #1 action users take with this data point.

"Verified" Badge Context

Current: A static "Verified" badge.

Suggestion: Add a hover Tooltip.

Content: "Identity verified via GitHub" or "KYC Completed".

Why: Users need to know what creates the trust factor.

Stats Cards Clarity

Reputation:

Issue: "94" is ambiguous. Is it 94 reviews? A score of 94/100?

Fix: If it is a score, use a visible denominator (e.g., "94/100") or a circular progress indicator.

Total Earned:

Issue: "15,420 CAPY" value is hard to gauge mentally.

Fix: Add a USD approximation below in smaller, muted text (e.g., ≈ $1,250 USD).

3. Navigation & Search (Bottom Section)

Search Functionality

Current: Only a "Sort by" dropdown is visible.

Suggestion: Add a Search Input on the left side of the toolbar (next to "6 datasets").

Why: As the user publishes more datasets (e.g., 12+), scrolling becomes inefficient. Searching by name is essential.

Tab Connection

Current: The tabs (Published / Downloads) are separated from the profile card by a large margin.

Suggestion: Reduce the margin-top between the Profile Card and the Tabs, or visually "dock" the tabs to the bottom of the profile card (similar to GitHub profiles).

4. Accessibility & Polish

Contrast Ratios

Issue: The label text inside the stats cards ("Published", "Downloads") is a dark grey on a black background.

Fix: Lighten the text color (e.g., text-gray-400 to text-gray-300) to ensure it passes WCAG AA standards for readability.

Primary Action Hierarchy

Issue: "Edit Profile" uses an outline style, which usually implies a secondary action.

Fix: If this view is for the owner, "Edit Profile" is likely the primary action. Consider a solid fill color (or a slightly thicker border) to distinguish it from the purely functional "Share" button next to it.