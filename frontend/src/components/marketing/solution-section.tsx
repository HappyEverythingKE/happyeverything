import ListIcon from '@/assets/icons/list-icon.svg'
import SendIcon from '@/assets/icons/send-message-icon.svg'
import SurpriseIcon from '@/assets/icons/surprise-box-icon.svg'

const sections = [
  {
    image: {
      src: ListIcon,
      alt: 'List icon',
    },
    heading: 'Create your list',
    description:
      'Sign up to create your wish list and add the goodies and gadgets you love.',
  },
  {
    image: {
      src: SendIcon,
      alt: 'Send message icon',
    },
    heading: 'Share it your way',
    description:
      'Send your list to friends and family or share it on social media. Help them gift you with confidence.',
  },
  {
    image: {
      src: SurpriseIcon,
      alt: 'Gift surprise icon',
    },
    heading: 'Unwrap',
    description: `Receive gifts you’ll actually love.
    Zero awkward exchanges. 100% happy vibes.`,
  },
]

export function SolutionSection() {
  return (
    <section id="solution-section" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="rb-12 md:mb-18 mb-12 text-center lg:mb-20">
        <div className="mx-auto w-full max-w-3xl">
          <h2 className="text-balance text-xl md:text-2xl">
            Gifting made <span className="font-italic">simple</span> in 3 easy
            steps
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 items-start justify-center gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:gap-x-12">
        {sections.map((section, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="relative mb-5 md:mb-6">
              <img
                src={section.image.src}
                alt={section.image.alt}
                className="z-1 relative size-12"
                width="512"
                height="512"
              />
              <div className="bg-tangerine absolute right-[20%] top-[20%] size-[80%] blur-md"></div>
            </div>
            <h3 className="text-md mb-5 md:mb-6">{section.heading}</h3>
            <p className="whitespace-pre-line text-balance">
              {section.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
