import { Link } from '@tanstack/react-router'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

const questions = [
  {
    title: 'Is it free to use this service?',
    answer:
      'Yes! Our website is completely free to use. No hidden fees or subscriptions.',
  },
  {
    title: 'Can I make my wish lists private?',
    answer:
      'Absolutely! You can password-protect your lists to keep them private and share the password only with selected people.',
  },
  {
    title: 'What can I add to my wish list?',
    answer:
      'Anything you want! Include photos, descriptions, and direct shopping links to make it easy for your friends and family to find the perfect gift.',
  },
  {
    title: 'How do I share my list?',
    answer:
      'Each list gets a unique link. Send it in a message, post it in a group or share it on social media. If it’s password-protected, only those you give the password can access your list.',
  },
  {
    title: 'Do I need an account to create a wish list?',
    answer:
      'Yes, signing up is quick and easy! Creating an account helps you create and manage your lists across all your devices.',
  },
  {
    title: 'Do I need an account to view a wish list?',
    answer:
      'You can browse lists without signing up, but creating an account lets you make and share your own.',
  },
  {
    title: 'Can I edit my list after sharing it?',
    answer:
      'Of course! You can update your list anytime to add new items, remove old ones, or make changes as needed. You cannot edit an item once it has been crossed-off your list. ',
  },
  {
    title: 'Is this service available worldwide?',
    answer: 'Yes! Gift with confidence from anywhere in the world.',
  },
  {
    title: 'What occasions are wish lists for?',
    answer:
      'Wish lists are for whatever your celebrating. Birthdays, weddings, anniversaries, baby showers, or even a personal "treat myself" list!',
  },
  {
    title: 'How many lists can I create?',
    answer:
      'You can create 3 lists in total. Each list can hold a maximum of 20 items. Let us know if you’d like more!',
  },
]

export function FaqSection() {
  return (
    <section id="faqs" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="rb-12 md:mb-18 mb-12 text-center lg:mb-20">
          <h2 className="rb-5 mb-5 text-xl md:mb-6 md:text-2xl">
            Have questions?
          </h2>
          <p>We&apos;ve got answers</p>
        </div>
        <Accordion type="multiple">
          {questions.map((question, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="font-sans font-semibold md:py-5">
                {question.title}
              </AccordionTrigger>
              <AccordionContent className="md:pb-6">
                {question.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="md:mt-18 mx-auto mt-12 max-w-md text-center lg:mt-20">
          <h4 className="mb-3 text-lg md:mb-4">Need help?</h4>
          <p>Get in touch with us if you need any support.</p>
          <div className="mt-6 md:mt-8">
            <Button variant="outline">
              <Link to="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
