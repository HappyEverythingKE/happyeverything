import { useState } from 'react'

import { Gift, Heart, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { SheetForm } from '@/components/ui/sheet-form'
import { NewListForm } from '@/components/dashboard/index/new-list-form'

export const WithoutLists = ({ profileSlug }: { profileSlug: string }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleSubmit = () => {
    setIsSheetOpen(false)
  }

  const handleCancel = () => {
    setIsSheetOpen(false)
  }

  return (
    <div className="mx-auto w-full p-8">
      <h1 className="text-xl">Let&apos;s get started</h1>

      <div className="flex h-full flex-col items-center justify-center">
        <Button
          variant="ghost"
          className="h-auto w-full p-0 hover:bg-transparent"
          onClick={() => setIsSheetOpen(true)}
        >
          <Card className="group relative w-full max-w-md overflow-hidden border border-orange-200/60 bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 shadow-md backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-lg">
            {/* sparkle decorations */}
            <div className="absolute right-4 top-4 text-orange-300 transition-colors duration-300 group-hover:text-orange-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="absolute right-6 top-9 text-pink-300 transition-colors duration-300 group-hover:text-pink-400 lg:right-9 lg:top-8">
              <Sparkles className="h-3 w-3" />
            </div>

            <CardHeader>
              <CardTitle className="text-pretty font-serif md:text-lg">
                Create your first wish list
              </CardTitle>
            </CardHeader>
          </Card>
        </Button>

        {/* supporting text */}
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

      {/* Sheet Form */}
      <SheetForm isOpen={isSheetOpen} onClose={handleCancel} title="New List">
        <NewListForm
          profileSlug={profileSlug}
          onFormSubmit={handleSubmit}
          onFormCancel={handleCancel}
        />
      </SheetForm>
    </div>
  )
}

export default WithoutLists
