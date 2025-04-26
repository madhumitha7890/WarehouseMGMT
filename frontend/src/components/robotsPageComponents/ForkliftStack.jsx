// components/ForkliftStack.jsx
import { itemColors } from '../../constants/index'
import { FORKLIFT_CAPACITY } from '../../constants/index'

const ForkliftStack = ({ items = [] }) => {
  // Generate a unique key for item rendering
  const getItemKey = (item) => `item-${item.zone}-${item.itemID}-${Math.random().toString(36).substr(2, 9)}`
  
  // Render a single item in the stack
  const renderStackItem = (item) => {
    // Convert item type to proper case for using with constants
    const itemType = item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1).toLowerCase()
    
    return (
      <div 
        key={getItemKey(item)} 
        className={`${itemColors[itemType]} border p-2 m-1 rounded shadow-sm`}
      >
        <div className="font-medium">{item.name}</div>
        <div className="text-xs">ID: {item.itemID}</div>
        <div className="text-xs">Rack: {item.assignedRackId}</div>
      </div>
    )
  }
  
  return (
    <div>
      <h3 className="font-semibold mb-2">Forklift Stack ({items.length}/{FORKLIFT_CAPACITY}):</h3>
      <div className="border border-dashed border-gray-300 rounded-lg p-3 min-h-40">
        {items.length > 0 ? (
          items.map(item => renderStackItem(item))
        ) : (
          <div className="text-gray-400 text-center py-6">Empty</div>
        )}
      </div>
    </div>
  )
}

export default ForkliftStack