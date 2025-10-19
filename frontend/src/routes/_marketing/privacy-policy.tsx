import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/privacy-policy')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container mx-auto max-w-4xl grow px-[5%] py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: October 2025</p>
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
            We don’t sell or rent your information - ever. If you share a list
            publicly, it can be viewed by anyone with the link. Private or
            password-protected lists are visible only to people you share them
            with.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Cookies</h2>
          <p>
            We use cookies to keep you signed in, remember your preferences, and
            understand how visitors use the site. See our Cookie Preferences
            page for more.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Your choices</h2>
          <p>
            You can edit or delete your account and lists anytime. If you’d like
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
            Reach out on email or any of our socials, we’re happy to help. In
            the meantime, there’s also an FAQ section at the bottom of our home
            page. Maybe one of those will give you the answers you seek!
          </p>
        </div>
      </div>
    </div>
  )
}
