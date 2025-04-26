// components/StatusUpdates.jsx

const StatusUpdates = ({ status, logs = [] }) => {
    return (
      <div>
        <h3 className="font-semibold mb-2">Status Updates:</h3>
        <div className="border rounded-lg p-3 min-h-40 bg-gray-50">
          {status === 'MOVING_TO_ZONE' && (
            <div className="text-yellow-600">Forklift is moving to zone...</div>
          )}
          
          {status === 'RETURNING' && (
            <div className="text-purple-600">Forklift is returning to station...</div>
          )}
          
          {status === 'PLACING_ITEMS' && logs.length > 0 && (
            <div>
              {logs.map((log) => (
                <div key={log.key} className="text-blue-600 mb-1">{log.message}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  export default StatusUpdates