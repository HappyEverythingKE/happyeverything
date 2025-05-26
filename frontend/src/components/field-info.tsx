import { type AnyFieldApi } from '@tanstack/react-form'

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <p className="text-destructive mt-1 text-xs">
          {field.state.meta.errors.map((err) => err.message).join(',')}
        </p>
      ) : null}
    </>
  )
}
