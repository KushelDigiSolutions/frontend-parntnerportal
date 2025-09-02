import React from "react";

export default function ReferralEarnings() {
  return (
    <div className="min-h-screen bg-[#f5f9ff] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-xl text-black">Start Referring</h2>
          <p className="text-gray-400 text-sm">This is Dummy</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">+ Refer New Client</button>
      </div>
      <div className="bg-indigo-600 rounded-lg p-8 flex gap-16 text-white">
        <div>
          <p className="text-lg">All time earnings</p>
          <p className="text-3xl font-bold mt-2">$0</p>
        </div>
        <div>
          <p className="text-lg">Last month earnings</p>
          <p className="text-3xl font-bold mt-2">$0</p>
        </div>
      </div>
    </div>
  );
}
