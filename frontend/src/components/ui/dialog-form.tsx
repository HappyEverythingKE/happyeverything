import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type DialogFormProps = {
  isOpen: boolean
  onClose: () => void
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}

function DialogForm({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
}: DialogFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-[80vh] overflow-hidden p-0">
        <DialogHeader className="border-sidebar-border flex-shrink-0 border-b p-4 pb-3 sm:p-6 sm:pb-4">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="whitespace-pre-line text-base">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Dialog Content */}
        <div className="flex-1 overflow-y-auto p-4 pt-3 sm:p-6 sm:pt-4">
          {children}
        </div>

        {/* Dialog Footer */}
        {footer && (
          <div className="border-sidebar-border flex-shrink-0 border-t p-4 pt-3 sm:p-6 sm:pt-4">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { DialogForm }
