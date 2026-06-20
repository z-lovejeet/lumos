import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"

export default function Loading() {
  return (
    <div className="container max-w-5xl py-6">
      <LoadingSkeleton type="detail" />
    </div>
  )
}
