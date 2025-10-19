import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/terms-of-service')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container mx-auto max-w-4xl grow px-[5%] py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Terms of Service</h1>
        <p className="text-sm text-gray-500">Last updated: October 2025</p>
      </div>

      <div className="flex flex-col gap-8">
        <p className="mb-4 text-center">
          Welcome to Happy Everything! By using our website, you agree to these
          simple terms.
        </p>

        <div>
          <h2 className="text-lg font-bold">Using the site</h2>
          <ul className="ml-2 list-inside list-disc">
            <li>
              You must be 18 or older (or have permission from a
              parent/guardian).
            </li>
            <li>
              You’re responsible for keeping your account details private.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Your content</h2>
          <p>
            You own everything you add - your photos, descriptions, links, and
            ideas. By posting or sharing them on Happy Everything, you give us
            permission to display them so your friends and family can see your
            lists.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Our part</h2>
          <p>
            We do our best to keep the site running smoothly. Sometimes we
            update, pause, or make changes to improve the service - we’ll always
            try to give notice.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">No guarantees</h2>
          <p>
            We aim for 100% happy vibes, but we can’t promise zero glitches.
            Happy Everything isn’t responsible for any issues that arise from
            using third-party links, stores, or products listed on wish lists.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold">Cookie Settings</h2>
            <p>Cookies help Happy Everything stay, well, happy.</p>
          </div>
          <div>
            <h3 className="font-bold">What they do</h3>
            <ul className="ml-2 list-inside list-disc">
              <li>Keep you signed in.</li>
              <li>Remember your preferences.</li>
              <li>
                Show us what’s working (through anonymous analytics) to make the
                site better.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-bold">Types of cookies</h3>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Type</th>
                  <th className="text-left">Purpose</th>
                  <th className="text-left">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b py-2">
                  <td>Essential</td>
                  <td>Keeps the site secure and working properly</td>
                  <td>Login session</td>
                </tr>

                <tr className="border-b py-2">
                  <td>Functional</td>
                  <td>Remembers your choices</td>
                  <td>Language or theme</td>
                </tr>

                <tr className="border-b py-2">
                  <td>Analytics</td>
                  <td>Helps us improve the site</td>
                  <td>Google Analytics</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="font-bold">Managing your cookies</h3>
            <p>
              You can manage or delete cookies anytime in your browser settings.
              If you disable them, some parts of the site might not work
              perfectly - but we’ll still love you.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold">Contact</h2>
          <p>
            Questions? Email us at{' '}
            <a
              href="mailto:hello@myhappyeverything.com"
              className="text-primary underline-offset-1 hover:underline"
            >
              hello@myhappyeverything.com
            </a>
            , or hit us up on any of our socials!
          </p>
        </div>
      </div>
    </div>
  )
}
