// components/ForkliftAnimation.jsx

const ForkliftAnimation = ({ position, direction, status }) => {
    // Determine forklift icon/emoji based on direction
    const forkliftIcon = direction === 'forward' ? '🚛➡️' : '🚛⬅️'
    
    // For placing items, use a special icon
    const displayIcon = status === 'PLACING_ITEMS' ? '🏗️' : forkliftIcon
    
    return (
      <div className="relative h-8 my-4">
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-300 rounded">
          <div className="absolute h-4 -top-1" style={{ left: `${position}%` }}>
            <div className="text-2xl transform -translate-y-1">{displayIcon}</div>
          </div>
        </div>
      </div>
    )
  }
  
  export default ForkliftAnimation