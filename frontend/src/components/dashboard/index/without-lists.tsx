import { Gift, Heart, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function WithoutLists() {
  const createList = () => {
    // TODO: Implement list creation and form modal popup.
    console.log('Creating new list...')
  }

  return (
    <>
      {/* TODO fix mobile responsiveness */}
      <div className="mx-auto flex min-h-full flex-col items-center justify-center space-y-8">
        <Button
          onClick={createList}
          variant="ghost"
          className="h-auto w-full p-0 hover:bg-transparent"
        >
          <Card className="group relative w-full max-w-lg cursor-pointer overflow-hidden border border-orange-200/60 bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
            {/* sparkle decorations */}
            <div className="absolute right-4 top-4 text-orange-300/40 transition-colors duration-300 group-hover:text-orange-400/60">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="absolute right-12 top-8 text-pink-300/30 transition-colors duration-300 group-hover:text-pink-400/50">
              <Sparkles className="h-3 w-3" />
            </div>

            <CardContent className="p-8">
              <div className="flex items-center space-x-6">
                {/* gift and heart icons on left */}
                <div className="relative flex-shrink-0">
                  <div className="w-18 h-18 flex items-center justify-center rounded-2xl bg-gradient-to-br from-orange-300 via-orange-400 to-pink-400 shadow-lg transition-all duration-300 group-hover:from-orange-400 group-hover:via-orange-500 group-hover:to-pink-500">
                    <Gift className="h-9 w-9 text-white" />
                  </div>
                  {/* small heart accent */}
                  <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-red-400 transition-transform duration-300 group-hover:scale-110">
                    <Heart className="h-3 w-3 fill-white text-white" />
                  </div>
                </div>

                {/* card content */}
                <div className="flex-1">
                  <h3 className="mb-2 text-left text-xl transition-colors duration-300 group-hover:text-orange-800">
                    Create your first wish list
                  </h3>
                  <p className="mb-3 text-sm leading-relaxed text-gray-600">
                    Share your dreams and desires with friends and family
                  </p>

                  <div className="flex items-center text-orange-600 transition-colors duration-300 group-hover:text-orange-700">
                    <span className="text-sm font-medium">Get started</span>
                    <svg
                      className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Button>

        {/* encouragement text for wish lists */}
        <div className="mt-12 max-w-lg text-center">
          <p className="mb-4 text-sm leading-relaxed text-gray-500">
            Create wish lists for any occasion - birthdays, holidays, weddings,
            or just because. Share them with loved ones so they know exactly
            what would make you smile.
          </p>
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Gift className="h-3 w-3" />
              <span>Easy to share</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span>Always updated</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>Surprise-proof</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
