import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/privacy-policy')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container mx-auto max-w-4xl grow px-[5%] py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: April 2026</p>
      </div>

      <div className="flex flex-col gap-4">
        <p className="mb-4 text-center">
          At Happy Everything, your privacy matters to us - almost as much as
          getting the perfect gift.
        </p>

        <div>
          <h2 className="text-lg font-bold">What we collect</h2>
          <p>
            When you sign up, we collect basic info like your name, email
            address, and the details you add to your wish lists (including
            photos, descriptions, and links). We also collect standard analytics
            data (like page views, browser type, and location) to help us make
            the site better.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">How we use it</h2>
          <p>We use your information to:</p>
          <ul className="ml-2 list-inside list-disc">
            <li>Create and manage your wish lists.</li>
            <li>Let you share them with friends and family.</li>
            <li>
              Send helpful updates or reminders (you can opt out anytime).
            </li>
            <li>Improve the Happy Everything experience.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Sharing and visibility</h2>
          <p>
            We don't sell or rent your information - ever. If you share a list
            publicly, it can be viewed by anyone with the link. Private or
            password-protected lists are visible only to people you share them
            with.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Cookies</h2>
          <p>
            We use cookies to keep you signed in, remember your preferences, and
            understand how visitors use the site.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Chrome Extension</h2>
          <p>
            The Happy Everything Chrome extension allows you to save items from
            any webpage directly to your wish list. When you click the extension
            button, it reads the <strong>URL and title of your active browser
            tab</strong> — and only that tab — so it can open the correct
            add-to-list page on Happy Everything.
          </p>
          <p className="mt-2">
            We want to be clear about what the extension does and doesn't do:
          </p>
          <ul className="ml-2 mt-2 list-inside list-disc">
            <li>
              It reads your tab URL and title <strong>only when you click
              the extension button</strong>. It does not run in the background,
              track your browsing history, or monitor any tabs you haven't
              explicitly interacted with.
            </li>
            <li>
              The URL and title are passed directly to
              myhappyeverything.com as URL parameters — the same way you'd
              copy-paste a link yourself. They are not stored by the extension
              and are not shared with any third party.
            </li>
            <li>
              No data is collected or transmitted until you actively click
              "Add to my list."
            </li>
          </ul>
          <p className="mt-2">
            The extension requires the <code className="text-sm bg-secondary px-1 rounded">tabs</code> and{' '}
            <code className="text-sm bg-secondary px-1 rounded">activeTab</code> permissions
            in Chrome. These are the minimum permissions needed to read the
            current tab's URL and title.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Your choices</h2>
          <p>
            You can edit or delete your account and lists anytime. If you'd like
            us to delete your data completely, just email{' '}
            <a
              href="mailto:hello@myhappyeverything.com"
              className="text-primary underline-offset-1 hover:underline"
            >
              hello@myhappyeverything.com
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Questions?</h2>
          <p>
            Reach out on email or any of our socials, we're happy to help. In
            the meantime, there's also an FAQ section at the bottom of our home
            page. Maybe one of those will give you the answers you seek!
          </p>
        </div>
      </div>
    </div>
  )
}
