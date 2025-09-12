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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <div className="flex max-h-[90vh] flex-col">
          <DialogHeader className="border-sidebar-border flex-shrink-0 border-b p-6 pb-4">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          {/* Dialog Content */}
          <div className="flex-1 overflow-y-auto p-6 pt-4">{children}</div>

          {/* Dialog Footer */}
          {footer && (
            <div className="border-sidebar-border flex-shrink-0 border-t p-6 pt-4">
              {footer}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { DialogForm }
