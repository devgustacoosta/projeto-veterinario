import React, { useState } from "react";
import { usePets } from "../../hooks/usePets";
import { Plus, Trash2, PawPrint, Edit2 } from "lucide-react";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";

const Pets = () => {
  const { pets, loading, addPet, updatePet, deletePet } = usePets();
  const [modalPet, setModalPet] = useState({
    open: false,
    mode: "create",
    data: null,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    id: null,
  });
  const [formData, setFormData] = useState({
    nome: "",
    especie: "",
    raca: "",
    data_nasc: "",
    sexo: "desconhecido",
  });

  const handleOpenModal = (mode, pet = null) => {
    setModalPet({ open: true, mode, data: pet });
    setFormData(
      pet
        ? {
            nome: pet.nome || "",
            especie: pet.especie || "",
            raca: pet.raca || "",
            data_nasc: pet.data_nasc || "",
            sexo: pet.sexo || "desconhecido",
          }
        : {
            nome: "",
            especie: "",
            raca: "",
            data_nasc: "",
            sexo: "desconhecido",
          }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success =
      modalPet.mode === "create"
        ? await addPet(formData)
        : await updatePet(modalPet.data.id, formData);

    if (success) {
      setModalPet({ open: false, mode: "create", data: null });
    }
  };

  const confirmDelete = (id) => {
    setConfirmDialog({ isOpen: true, id });
  };

  const handleDelete = async () => {
    if (confirmDialog.id) {
      await deletePet(confirmDialog.id);
    }
  };

  if (loading) return <Loading text="Carregando seus pets..." />;

  return (
    <div className="w-full flex flex-col items-start animate-in fade-in duration-300">
      <div className="w-full max-w-4xl flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Meus Pets
          </h1>
          <p className="text-slate-500 text-sm">
            Gerencie os perfis dos seus animais de estimação.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2 bg-brand-600 text-white py-2.5 px-5 rounded-xl font-semibold shadow-sm hover:bg-brand-700 transition-all"
        >
          <Plus size={18} /> Novo Pet
        </button>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-5">
        {pets.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 border-dashed py-16 flex flex-col items-center justify-center rounded-2xl text-slate-500">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <PawPrint size={32} className="text-slate-400" />
            </div>
            <p className="font-medium">
              Você ainda não possui pets cadastrados.
            </p>
          </div>
        ) : (
          pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white border border-slate-100 shadow-sm p-6 rounded-2xl flex justify-between items-start transition-all group hover:shadow-md"
            >
              <div className="flex gap-4">
                <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
                  <PawPrint size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {pet.nome}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 mt-1.5">
                    <span className="bg-slate-100 px-2 py-1 rounded-md">
                      {pet.especie}
                    </span>
                    {pet.raca && <span>• {pet.raca}</span>}
                    {pet.sexo && pet.sexo !== "desconhecido" && (
                      <span>• {pet.sexo === "M" ? "Macho" : "Fêmea"}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleOpenModal("edit", pet)}
                  className="text-slate-400 hover:text-brand-600 p-2 transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => confirmDelete(pet.id)}
                  className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={modalPet.open}
        onClose={() => setModalPet({ ...modalPet, open: false })}
        title={modalPet.mode === "create" ? "Novo Pet" : "Editar Pet"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700">Nome*</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:border-brand-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700">
                Espécie*
              </label>
              <input
                type="text"
                placeholder="Cão, Gato..."
                value={formData.especie}
                onChange={(e) =>
                  setFormData({ ...formData, especie: e.target.value })
                }
                className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:border-brand-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700">Raça</label>
              <input
                type="text"
                value={formData.raca}
                onChange={(e) =>
                  setFormData({ ...formData, raca: e.target.value })
                }
                className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.data_nasc}
                onChange={(e) =>
                  setFormData({ ...formData, data_nasc: e.target.value })
                }
                className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">Sexo</label>
            <select
              value={formData.sexo}
              onChange={(e) =>
                setFormData({ ...formData, sexo: e.target.value })
              }
              className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:border-brand-500 bg-white"
            >
              <option value="M">Macho</option>
              <option value="F">Fêmea</option>
              <option value="desconhecido">Desconhecido</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setModalPet({ ...modalPet, open: false })}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-brand-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-brand-700 transition-all"
            >
              {modalPet.mode === "create"
                ? "Cadastrar Pet"
                : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Excluir Pet"
        message="Tem certeza que deseja excluir este pet? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        isDestructive={true}
      />
    </div>
  );
};

export default Pets;
