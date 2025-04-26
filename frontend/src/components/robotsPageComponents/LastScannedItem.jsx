// components/LastScannedItem.jsx
import { itemColors, itemTypeIcons } from '../../constants/index'

const LastScannedItem = ({ item }) => {
  if (!item) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Last Scanned Item</h2>
        <div className="text-gray-500">No items scanned yet</div>
      </div>
    )
  }

  // Convert item type to proper case for using with constants
  const itemType = item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1).toLowerCase()

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-3">Last Scanned Item</h2>
      
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${itemColors[itemType]}`}>
          <span className="text-xl">{itemTypeIcons[itemType]}</span>
        </div>
        <div>
          <div className="font-medium">{item.name} (ID: {item.itemID})</div>
          <div className="text-sm text-gray-600">
            Assigned to Zone {item.zone}, Rack {item.assignedRackId}
          </div>
          <div className="text-xs text-gray-500">
            Timestamp: {new Date(item.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LastScannedItem