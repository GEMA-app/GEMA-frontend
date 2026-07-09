import React from "react";
export default function Page() {
	return (
		<main className="min-h-screen bg-white flex justify-center py-8 h-full overflow-y-auto" style={{ fontFamily: "Roboto, sans-serif" }}>
			<style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700;900&display=swap');`}</style>

			<section className="w-full max-w-[1260px] bg-white p-6 rounded-1">
				<div className="flex flex-col gap-4 h-full overflow-y-auto">
					<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-16 h-16 rounded-[20px] bg-white border" style={{ borderWidth: 2, borderColor: '#FF0000' }}>
								<img src="/cubo.svg" alt="Icono cubo" className="w-8 h-8" />
							</div>

						<div>
							<h1 className="text-[36px] font-black text-[#000000] leading-none">RepuestoX</h1>
							<p className="text-gray-600 mt-2">ID:</p>
						</div>
					</div>

					<div className="border-b border-gray-200" />

					<div className="grid grid-cols-3 gap-4 mb-6">
						{[
							{ label: "Stock Actual", value: "", border: "#0A8E71" },
							{ label: "Stock Mínimo", value: "", border: "#FF0000" },
							{ label: "Costo Unitario", value: "", border: "#0066FF" },
						].map((item) => (
							<div
								key={item.label}
								className="rounded-[20px] bg-[#EBDDC5] p-6 flex flex-col justify-between min-h-[150px] break-words shadow-md transition-shadow duration-150 hover:shadow-lg"
								style={{ border: `2px solid ${item.border}` }}
							>
								<p className="text-[10px] font-bold text-[#000000] tracking-wider uppercase">{item.label}</p>
								<p className="text-4xl font-bold text-black">{item.value}</p>
							</div>
						))}
					</div>

					<p className="text-[10px] font-bold text-[#000000] tracking-wider uppercase mb-2">Descripción técnica</p>
					<div className="mb-6 rounded-[20px] bg-[#E59D2C]/25 p-8 w-full shadow-md" style={{ borderWidth: 2, borderColor: '#EBDDC5', borderStyle: 'solid' }}>
						<p className="text-lg font-semibold text-black break-words">{''}</p>
					</div>

					<div className="grid grid-cols-2 gap-4 mb-6">
						<div className="rounded-[20px] bg-white p-10 min-h-[170px]" style={{ border: '2px solid #EBDDC5' }}>
							<p className="text-[10px] font-bold text-[#E59D2C] tracking-wider uppercase">Proveedor principal</p>
							<p className="mt-4 text-base font-semibold text-black break-words">{''}</p>
						</div>

						<div className="rounded-[20px] bg-white p-8 min-h-[150px] shadow-md" style={{ border: '2px solid #EBDDC5' }}>
							<p className="text-[10px] font-bold text-[#E59D2C] tracking-wider uppercase">Ubicación</p>
							<p className="mt-4 text-base font-semibold text-black break-words">{''}</p>
						</div>
					</div>

					<div className="space-y-2 mb-6">
							<div className="rounded-[20px] bg-white w-full min-h-[60px]" style={{ border: '2px solid #EBDDC5' }}>
							<div className="h-full flex items-center px-4 py-3">
								<div className="flex items-center gap-3">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
										<rect x="3" y="4" width="18" height="18" rx="2" stroke="#000" strokeWidth="2" fill="none" />
										<path d="M16 2v4M8 2v4" stroke="#000" strokeWidth="2" />
									</svg>
									<div>
										<p className="text-[10px] font-bold text-[#E59D2C] tracking-wider uppercase">Fecha de registro</p>
										<p className="text-base text-black break-words">{''}</p>
									</div>
								</div>
							</div>
						</div>

						<div className="rounded-[20px] bg-white w-full min-h-[90px]" style={{ border: '2px solid #EBDDC5' }}>
							<div className="h-full flex items-center px-4 py-3">
								<div className="flex items-center gap-3">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
										<circle cx="12" cy="12" r="9" stroke="#000" strokeWidth="2" fill="none" />
										<path d="M12 7v6l4 2" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
									<div>
										<p className="text-[10px] font-bold text-[#E59D2C] tracking-wider uppercase">Última modificación</p>
										<p className="text-base text-black break-words">{''}</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="flex justify-center gap-4">
						<button className="w-[200px] h-[40px] rounded-[12px] bg-white text-black font-semibold px-10 py-2.5" style={{ border: '2px solid #8A3208' }}>
							Ajustar Stock
						</button>
						<button className="w-[200px] h-[40px] rounded-[12px] bg-[#E59D2C] text-[#000000] font-semibold px-10 py-2.5">
							Modificar Ficha
						</button>
					</div>
				</div>
			</section>
		</main>
	);
}
                                
