export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-5 px-5 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">Data and privacy</h1>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Accounts and pickups</h2>
        <p>Trashify uses your account details to sign you in. When you look up a pickup address, Trashify sends the postcode or landmark you enter to ResolveGrid to find the building. If you choose to verify a postcode at your location, ResolveGrid also sends that device location to NIPOST to check the nearest building. Enter location details only.</p>
        <p>Your assigned collector sees the pickup location and the contact number you choose to provide. During completion, Trashify checks the collector’s device location against the pickup address and records the result and time.</p>
      </section>
      <section className="space-y-2">
<h2 className="text-xl font-semibold">Sanitation reports</h2><p>Optional descriptions are processed into a fixed list of sanitation signals. Only those categories go to the AI provider for a suggested issue type. The description is not stored with the report. Dashboard AI receives service totals by district. You review suggestions before filing.</p>
        <p>Staff in the relevant service districts and, where applicable, your estate can see pickup status and issue categories. You can choose to share the pickup address for an individual report so staff can locate the issue. Staff access to that report address ends when the report is closed.</p>
        <p>Report observable waste problems. Do not include anyone’s medical information. The dashboard describes service activity on Trashify and does not record health outcomes.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Questions about your data</h2>
        <p>Contact the operator who enrolled your household, estate or service team in Trashify.</p>
      </section>
    </article>
  );
}
