import { useState } from 'react'

import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { SheetForm } from '@/components/ui/sheet-form'
import { NewListItemForm } from '@/components/dashboard/forms/new-list-item-form'

export const WithoutListItems = ({
  profileSlug,
  listSlug,
}: {
  profileSlug: string
  listSlug: string
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleSubmit = () => {
    setIsSheetOpen(false)
  }

  const handleCancel = () => {
    setIsSheetOpen(false)
  }

  return (
    <div className="mx-auto w-full p-8">
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
                Add your first gift item
              </CardTitle>
            </CardHeader>
          </Card>
        </Button>

        {/* supporting text */}
        <div className="mt-12 max-w-lg text-center">
          <p className="mb-4 text-sm leading-relaxed text-gray-500">
            Add a gift item to your wish list to get started. Try to include as
            much detail as possible, like links, prices, and descriptions.
          </p>
        </div>
      </div>

      {/* Sheet Form */}
      <SheetForm
        isOpen={isSheetOpen}
        onClose={handleCancel}
        title="Add Gift"
        description="Add a new gift to your wish list"
      >
        <NewListItemForm
          profileSlug={profileSlug}
          listSlug={listSlug}
          onFormSubmit={handleSubmit}
          onFormCancel={handleCancel}
        />
      </SheetForm>
    </div>
  )
}

export default WithoutListItems
