import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

type SheetProps = {
  isOpen: boolean
  onClose: () => void
  title: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}

function SheetForm({ isOpen, onClose, title, children, footer }: SheetProps) {
  if (!isOpen) return null

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent>
          <div className="flex h-full flex-col">
            <SheetHeader className="border-sidebar-border border-b p-6">
              <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
              {/* 
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button> */}
            </SheetHeader>

            {/* Sheet Content */}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>

            {/* Sheet Footer */}
            {footer && (
              <div className="border-sidebar-border border-t p-6">{footer}</div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export { SheetForm }
