import React, { useState } from "react";
import { Download, CheckCircle, X, Loader, AlertCircle } from "lucide-react";
import { parseExcelFile } from "../../utils/excelParser";

import "./BusinessDataUpload.css";

export default function BusinessDataUpload({ onUploadSuccess }) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileSelect = (file) => {
        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
        ];

        if (!validTypes.includes(file.type)) {
            alert("Please upload an Excel file (.xlsx or .xls)");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("File size must be less than 10MB");
            return;
        }

        setUploadedFile(file);
        setUploadError(null);
        setUploadSuccess(false);
        setUploadProgress("");
    };

    const handleFileInputChange = (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
        setUploadError(null);
        setUploadSuccess(false);
        setUploadProgress("");
    };

    const UploadCloudIcon = () => (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
    );

    const handleProcessTemplate = async () => {
        if (!uploadedFile) {
            alert("Please select a file first");
            return;
        }

        setIsUploading(true);
        setUploadError(null);
        setUploadSuccess(false);

        try {
            // Step 1: Parse Excel
            setUploadProgress("📊 Parsing Excel file...");
            const parsedData = await parseExcelFile(uploadedFile);

            if (!parsedData.products?.length) {
                throw new Error("No products found in the Excel file.");
            }

            const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
            if (!loggedUser?.userId) {
                throw new Error("User not authenticated.");
            }

            setUploadProgress("📦 Preparing data...");
            const formData = new FormData();
            formData.append("file", uploadedFile);
            formData.append("parsedData", JSON.stringify(parsedData));
            formData.append("ownerId", loggedUser.userId); // FIXED ✔

            setUploadProgress("⬆️ Uploading...");
            const response = await fetch("http://localhost:5001/api/business-data/upload", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server error (${response.status})`);
            }

            const result = await response.json();

            if (result.success) {
                setUploadSuccess(true);
                setUploadProgress("✅ Upload completed!");
                if (onUploadSuccess) onUploadSuccess(result.data);
            } else {
                throw new Error(result.msg || "Upload failed");
            }

        } catch (error) {
            console.error("🔥 Upload error:", error);
            setUploadError(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <div className="upload-card">
                <div className="card-content-center">
                    <div className="header-with-icon">
                        <div className="icon-wrapper download-icon">
                            <Download className="card-icon" />
                        </div>
                        <h2>Import Your Business Data</h2>
                    </div>

                    <p className="download-section-desc">
                        Organize your business data with Haseeb’s Excel template.
                    </p>

                    <button
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = '/assets/Haseeb-Business-Template.xlsx';
                            link.download = 'Haseeb-Business-Template.xlsx';
                            link.click();
                        }}
                        className="download-btn"
                    >
                        Download Template
                    </button>
                </div>
            </div>

            <div className="upload-card">
                <div className="upload-card-header">
                    <h2>Upload Completed Template</h2>
                    <p className="upload-subtitle">Ensure all required fields are filled before uploading</p>
                </div>

                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`file-drop-zone ${isDragging ? 'is-dragging' : ''}`}
                >
                    {!uploadedFile ? (
                        <div className="drop-zone-content">
                            <div
                                onClick={() => document.getElementById("file-input").click()}
                                className="cloud-icon-wrap"
                            >
                                <UploadCloudIcon />
                            </div>

                            <p className="drop-zone-title">Select a file to upload</p>
                            <p className="drop-zone-subtitle">or drag and drop your template here</p>

                            <button
                                onClick={() => document.getElementById("file-input").click()}
                                className="browse-btn"
                            >
                                Browse Files
                            </button>

                            <p className="upload-hint">Accepted: .xlsx / .xls — Max: 10MB</p>
                        </div>
                    ) : (
                        <div className="uploaded-file">
                            <div className="file-info">
                                <CheckCircle className="success-icon" />
                                <div className="file-details">
                                    <p className="file-name">{uploadedFile.name}</p>
                                    <p className="file-size">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button className="remove-btn" onClick={removeFile} disabled={isUploading}>
                                <X className="remove-icon" />
                            </button>
                        </div>
                    )}

                    <input
                        id="file-input"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileInputChange}
                        className="hidden-file-input"
                    />
                </div>

                {uploadProgress && (
                    <div className="progress-message">
                        {isUploading && <Loader className="progress-spinner" size={20} />}
                        <span>{uploadProgress}</span>
                    </div>
                )}

                {uploadError && (
                    <div className="error-message">
                        <AlertCircle size={20} />
                        <div>
                            <p className="error-title">Upload Failed</p>
                            <p>{uploadError}</p>
                        </div>
                    </div>
                )}

                {uploadSuccess && (
                    <div className="success-message">
                        <CheckCircle size={20} className="success-icon-msg" />
                        <span>Data uploaded successfully!</span>
                    </div>
                )}

                {uploadedFile && !uploadSuccess && (
                    <div className="process-btn-wrapper">
                        <button
                            className={`process-btn ${isUploading ? "processing" : ""}`}
                            onClick={handleProcessTemplate}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader className="btn-spinner" size={18} />
                                    Processing...
                                </>
                            ) : (
                                "Process Template"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
