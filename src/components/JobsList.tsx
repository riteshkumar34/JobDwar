import { motion } from 'framer-motion'
import { Job } from '@/lib/types'
import { JobCard } from './JobCard'

interface JobsListProps {
  jobs: Job[]
  onJobSelect?: (job: Job) => void
}

export function JobsList({ jobs, onJobSelect }: JobsListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job, index) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ y: -2 }}
          className="h-full"
        >
          <JobCard
            job={job}
            onClick={() => onJobSelect?.(job)}
          />
        </motion.div>
      ))}
    </div>
  )
}
