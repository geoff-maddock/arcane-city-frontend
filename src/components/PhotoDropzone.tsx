
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { api } from '../lib/api';

interface PhotoDropzoneProps {
    eventId?: number;
    entityId?: number;
    seriesId?: number;
}

export default function PhotoDropzone({ eventId, entityId, seriesId }: PhotoDropzoneProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = async (acceptedFiles: File[]) => {
        setError(null);
        if (acceptedFiles.length === 0) return;
        setLoading(true);
        try {
            for (const file of acceptedFiles) {
                const formData = new FormData();
                formData.append('file', file);

                if (eventId) {
                    await api.post(`/events/${eventId}/photos`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                } else if (entityId) {
                    await api.post(`/entities/${entityId}/photos`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                } else if (seriesId) {
                    await api.post(`/series/${seriesId}/photos`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                }
            }
            window.location.reload();
        } catch (err) {
            console.error(err);
            setError('Failed to upload photos.');
        } finally {
            setLoading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: true,
    });

    return (
        <div className="space-y-2">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${isDragActive ? 'bg-gray-100' : ''}`}
            >
                <input {...getInputProps()} />
                <p>Drag and drop images here, or click to select files</p>
            </div>
            {loading && <p className="text-sm text-gray-600">Uploading...</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}