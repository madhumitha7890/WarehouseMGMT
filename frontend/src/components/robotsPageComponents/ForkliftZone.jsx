// components/ForkliftZone.jsx
import ForkliftAnimation from './ForkliftAnimation'
import ForkliftStack from './ForkliftStack'
import StatusUpdates from './StatusUpdates'
import { zoneHeaderColors, forkliftStatusColors, zoneToItemMap } from '../../constants/index'

const ForkliftZone = ({ 
  zone, 
  status, 
  stack, 
  position, 
  direction, 
  logs
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`${zoneHeaderColors[zone]} text-white font-bold text-lg p-3`}>
        Zone {zone}: {zoneToItemMap[zone]}s
      </div>
      
      <div className="p-4">
        {/* Forklift Status */}
        <div className="mb-4">
          <div className="font-semibold mb-1">Forklift Status:</div>
          <div className={`inline-block px-3 py-1 rounded-full text-white text-sm ${forkliftStatusColors[status]}`}>
            {status.replace(/_/g, ' ')}
          </div>
        </div>

        {/* Forklift Animation */}
        <ForkliftAnimation position={position} direction={direction} status={status} />
        
        {/* Forklift Stack or Status Updates */}
        {status === 'AT_STATION' ? (
          <ForkliftStack items={stack} />
        ) : (
          <StatusUpdates status={status} logs={logs} />
        )}
      </div>
    </div>
  )
}

export default ForkliftZone