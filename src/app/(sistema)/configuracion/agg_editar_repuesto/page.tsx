"use client";

import Link from "next/link";
import React, { useState } from "react";

const initialValues = {
	name: "RepuestoX",
	id: "h12345",
	stockActual: 32,
	stockMinimo: 10,
	costoUnitario: 58,
	descripcionTecnica: "Rodamiento de Bolas de Alta Precisión - Serie 6200",
	proveedorPrincipal: "",
	ubicacion: "",
	fechaRegistro: "",
	ultimaModificacion: "",
};

export default function Page() {
	const [descripcionTecnica, setDescripcionTecnica] = useState(initialValues.descripcionTecnica);
	const [proveedorPrincipal, setProveedorPrincipal] = useState(initialValues.proveedorPrincipal);
	const [ubicacion, setUbicacion] = useState(initialValues.ubicacion);
	const [fechaRegistro, setFechaRegistro] = useState(initialValues.fechaRegistro);
	const [ultimaModificacion, setUltimaModificacion] = useState(initialValues.ultimaModificacion);

	const handleCancel = () => {
		setDescripcionTecnica(initialValues.descripcionTecnica);
		setProveedorPrincipal(initialValues.proveedorPrincipal);
		setUbicacion(initialValues.ubicacion);
		setFechaRegistro(initialValues.fechaRegistro);
		setUltimaModificacion(initialValues.ultimaModificacion);
	};

	const handleSave = () => {
		const now = new Date();
		setUltimaModificacion(
			now.toLocaleString("es-ES", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			})
		);
	};

	return (
		<main className="min-h-screen bg-white flex justify-center py-8 h-full overflow-y-auto" style={{ fontFamily: "Roboto, sans-serif" }}>
			<style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700;900&display=swap');`}</style>

			<section className="w-full max-w-[1260px] bg-white p-6 rounded-1 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
				<div className="flex flex-col gap-4 h-full overflow-y-auto">
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center w-16 h-16 rounded-[20px] bg-white border" style={{ borderWidth: 2, borderColor: '#FF0000' }}>
							<img src="/cubo.svg" alt="Icono cubo" className="w-8 h-8" />
						</div>

						<div>
							<h1 className="text-[36px] font-black text-[#000000] leading-none">{initialValues.name}</h1>
							<p className="text-gray-600 mt-2">ID: {initialValues.id}</p>
						</div>
					</div>

					<Link href="/configuracion/repuestos" className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-gray-900">
						<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
							<path d="M19 12H5" />
							<path d="M12 19l-7-7 7-7" />
						</svg>
						<span>Volver </span>
					</Link>

					<div className="border-b border-gray-200" />

					<div className="grid grid-cols-3 gap-4 mb-6">
						{[
							{ label: "Stock Actual", value: initialValues.stockActual, border: "#0A8E71" },
							{ label: "Stock Mínimo", value: initialValues.stockMinimo, border: "#FF0000" },
							{ label: "Costo Unitario", value: `$ ${initialValues.costoUnitario}`, border: "#0066FF" },
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

					<div>
						<p className="text-[10px] font-bold text-[#000000] tracking-wider uppercase mb-2">Descripción técnica</p>
						<textarea
							value={descripcionTecnica}
							onChange={(event) => setDescripcionTecnica(event.target.value)}
							placeholder="Escribe la descripción técnica aquí"
							className="mb-6 w-full rounded-[20px] bg-[#E59D2C]/25 p-5 text-base text-black placeholder:text-gray-500 outline-none shadow-md transition focus:ring-2 focus:ring-[#E59D2C]"
							rows={5}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4 mb-6">
						<div className="rounded-[20px] bg-white p-6 min-h-[170px]" style={{ border: '2px solid #EBDDC5' }}>
							<label className="text-[10px] font-bold text-[#E59D2C] tracking-wider uppercase">Proveedor principal</label>
							<input
								value={proveedorPrincipal}
								onChange={(event) => setProveedorPrincipal(event.target.value)}
								placeholder="Ingrese proveedor"
								className="mt-4 w-full bg-transparent text-base text-black outline-none"
							/>
						</div>

						<div className="rounded-[20px] bg-white p-6 min-h-[170px] shadow-md" style={{ border: '2px solid #EBDDC5' }}>
							<label className="text-[10px] font-bold text-[#E59D2C] tracking-wider uppercase">Ubicación</label>
							<input
								value={ubicacion}
								onChange={(event) => setUbicacion(event.target.value)}
								placeholder="Ingrese ubicación"
								className="mt-4 w-full bg-transparent text-base text-black outline-none"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4 mb-6">
						<div className="rounded-[20px] bg-white w-full min-h-[60px]" style={{ border: '2px solid #EBDDC5' }}>
							<div className="h-full flex items-center px-4 py-3 gap-4">
								<div className="flex items-center gap-3">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
										<rect x="3" y="4" width="18" height="18" rx="2" stroke="#000" strokeWidth="2" fill="none" />
										<path d="M16 2v4M8 2v4" stroke="#000" strokeWidth="2" />
									</svg>
								</div>
								<div className="flex-1">
									<p className="text-[10px] font-bold text-[#E59D2C] tracking-wider uppercase">Fecha de registro</p>
									<input
										type="date"
										value={fechaRegistro}
										onChange={(event) => setFechaRegistro(event.target.value)}
										className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-black outline-none"
									/>
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
								</div>
								<div>
									<p className="text-[10px] font-bold text-[#E59D2C] tracking-wider uppercase">Última modificación</p>
									<p className="text-base text-black break-words">{ultimaModificacion || "--"}</p>
								</div>
							</div>
						</div>
					</div>

					<div className="flex justify-center gap-4">
						<button
							type="button"
							onClick={handleCancel}
							className="w-[200px] h-[40px] rounded-[12px] bg-white text-black font-semibold px-10 py-2.5"
							style={{ border: '2px solid #8A3208' }}
						>
							Cancelar
						</button>
						<button
							type="button"
							onClick={handleSave}
							className="w-[200px] h-[40px] rounded-[12px] bg-[#E59D2C] text-[#000000] font-semibold px-10 py-2.5"
						>
							Guardar
						</button>
					</div>
				</div>
			</section>
		</main>
	);
}
