// components/ConnectionStatus.jsx

const ConnectionStatus = ({ isConnected }) => {
    return (
      <div className={`mt-8 p-4 ${isConnected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'} rounded-lg`}>
        <div className="flex items-center">
          <div className={`w-3 h-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2`}></div>
          <span className={isConnected ? 'text-green-700' : 'text-red-700'} font-medium>
            {isConnected ? 'Connected to WMS API' : 'Disconnected from WMS API'}
          </span>
        </div>
      </div>
    )
  }
  
  export default ConnectionStatus