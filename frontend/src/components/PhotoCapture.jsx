import { useState, useRef, useEffect } from 'react';

/**
 * PhotoCapture component for technicians to add photos when finalizing a Service Order
 * Uses browser camera access or file upload to capture images
 * Displays thumbnails of captured photos before submission
 */
function PhotoCapture({ onPhotosChange }) {
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

  // Notify parent component when photos change
  useEffect(() => {
    onPhotosChange?.(photos);
  }, [photos, onPhotosChange]);

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const photo = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file: file,
            preview: e.target.result,
            name: file.name,
          };
          setPhotos((prev) => [...prev, photo]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input so the same file can be selected again if needed
    event.target.value = '';
  };

  const handleRemovePhoto = (photoId) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Fotos da Ordem de Serviço
        </h3>
        <p className="text-sm text-gray-500">
          Adicione fotos para documentar o serviço realizado
        </p>
      </div>

      {/* Hidden file input with camera capture support */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-label="Selecionar foto"
      />

      {/* Add Photo Button */}
      <button
        type="button"
        onClick={handleAddPhoto}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <span className="mr-2">📷</span>
        Adicionar Foto
      </button>

      {/* Photo Thumbnails Grid */}
      {photos.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-3">
            {photos.length} {photos.length === 1 ? 'foto adicionada' : 'fotos adicionadas'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
              >
                <img
                  src={photo.preview}
                  alt={`Foto ${photo.name}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 hover:bg-red-600"
                  aria-label={`Remover foto ${photo.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {photos.length === 0 && (
        <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <span className="text-4xl mb-2 block">📷</span>
          <p className="text-gray-500">
            Nenhuma foto adicionada ainda
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Clique no botão acima para adicionar fotos
          </p>
        </div>
      )}
    </div>
  );
}

export default PhotoCapture;
