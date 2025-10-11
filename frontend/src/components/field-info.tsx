import { type AnyFieldApi } from '@tanstack/react-form'

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <div className="mt-1">
      {field.state.meta.isTouched && field.state.meta.errors.length
        ? field.state.meta.errors.map((err, idx) => (
            <p className="text-destructive text-xs" key={idx}>
              {err.message}
            </p>
          ))
        : null}
    </div>
  )
}
