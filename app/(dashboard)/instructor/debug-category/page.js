import { debugCategoryIssue } from '@/app/lib/actions/debugCategoryIssue'

export default async function DebugCategoryPage() {
  const debugResults = await debugCategoryIssue()
  
  return (
    <div className="container mt-5">
      <h1>Category Column Debug Results</h1>
      <div className="card mt-4">
        <div className="card-body">
          <pre>{JSON.stringify(debugResults, null, 2)}</pre>
        </div>
      </div>
      <div className="alert alert-info mt-4">
        <h5>Check the server console for detailed logs</h5>
        <p>The detailed debug information has been logged to the server console.</p>
      </div>
    </div>
  )
}