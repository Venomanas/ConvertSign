'use client'
     
import { useFileContext } from '@/context/FileContext';
import React, {useState } from 'react'
import { FileObject } from '@/utils/authUtils'

//define type for target formats
export type FormatOption = 'jpg'|'png'|'webp'|'gif'|'bmp'| 'pdf'| 'docx'|'txt'|'csv';

const FileConverter:React.FC = ()=>{

    const { files, updateFile} = useFileContext();
    const [selectedFile,setSelectedFile] = useState<FileObject | null>(null);
    const [targetFormat, setTargetFormat] = useState<FormatOption|''>('');
    const [isConverting, setIsConverting] = useState(false);
    const [conversionError, setConversionError]= useState('');

    //list of possible target formats based on file type
    const getTargetFormats = (fileType: string): FormatOption[]=>{
        if(!fileType) return[];

    // determine available target formats based on source format
    if(fileType.startsWith('image/')){
        return ['jpg','png','webp','gif','bmp'];
    }
    else if(fileType === 'application/pdf'){
        return['jpg','png','docx','txt'];
    }
    else if(fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
        return['pdf','txt']
    }
    else if(fileType === 'application/vnd.ms-excel'|| fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
        return['pdf','csv']
    }
    else if(fileType === 'application/vnd.ms-powerpont'|| fileType==='application/vnd.openxmlformats-officedocumnt.presentational.presentation'){
        return ['pdf','jpg'];
    }
    else{
        return[];
    }

    };
    // handle file selection
    const handleFileSelect =(fileId: string): void=>{
        const file = files.find(f=>f.id === fileId);
        if(file){
            setSelectedFile(file);
            setTargetFormat('');
            setConversionError('');
        }
    };

    //handle format selection
    const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>): void=> {
        setTargetFormat(e.target.value as FormatOption | '')
    }
    const getOriginalFormat = (file: FileObject | null): string =>{
        if(!file) return '';

        const typeMap: Record<string, string>={
            'image/jpeg': 'jpg',
            'image/png':'png',
            'image/webp':'webp',
            'application/pdf':'pdf',
            'application/msword':'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'docx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'xlsx',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation':'pptx',
            'application/vnd.ms-excel':'xls',
            'application/vnd.ms-powerpoint':'ppt',
            'text/plain':'txt'
        };
        return typeMap[file.type] || file.type.split('/')[1];
    };
    // handle Conversion
    const handleConvert = async (): Promise<void> =>{
        if(!selectedFile || !targetFormat){
            setConversionError('Please select both a file and a target format')
        }
        setIsConverting(true);
        setConversionError('');
        try {
          //conversion process with delay
          await new Promise(resolve => setTimeout(resolve, 1500));

          // In a real application, we would use a conversion API or library here
          // For now, we'll just simulate a successful conversion by creating a new file entry
          const originalFormat = getOriginalFormat(selectedFile);
          const newFileName = selectedFile?.name.replace(
            new RegExp(`\\.${originalFormat}$`, "i"),
            `.${targetFormat}`
          );
          if (selectedFile?.id) {
          updateFile(selectedFile.id, {
            name: newFileName,
            processed: true,
            convertedFormat: targetFormat,
            dateProccessed: new Date().toISOString(),
          });
        }
          // Reset selection after successful conversion
          setTargetFormat('');
          setSelectedFile(null);
        }catch(error){
            console.error('Conversion error:', error);
            setConversionError('An error ocurred during conversion. Please try again.')
        }
        finally{
            setIsConverting(false);
        }
    }
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Convert Files
        </h2>

        {files.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No files available for conversion.</p>
            <p className="text-gray-500 text-sm mt-2">
              Please upload files first.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Select File to Convert
              </h3>

              <div className="max-h-72 overflow-y-auto pr-2">
                {files.map(file => (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file.id)}
                    className={`flex items-center p-3 mb-2 rounded-md cursor-pointer transition-colors ${
                      selectedFile?.id === file.id
                        ? "bg-white hover:bg-blue-200 border border-blue-300"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    {/* File type icon */}
                    <div className="mr-3">
                      {file.type.startsWith("image/") ? (
                        <svg
                          className="w-6 h-6 text-black"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      ) : file.type.includes("pdf") ? (
                        <svg
                          className="w-6 h-6 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      )}
                    </div>

                    {/* File name and info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-900">
                        {(file.size / 1024).toFixed(2)} KB •{" "}
                        {getOriginalFormat(file).toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Conversion Options
              </h3>

              {selectedFile ? (
                <>
                  <div className="mb-4">
                    <p className="mb-2 text-sm text-black">Selected File:</p>
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="font-medium text-black">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-900">
                        Original format:{" "}
                        {getOriginalFormat(selectedFile).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-black mb-1">
                      Convert to:
                    </label>
                    <select
                      value={targetFormat}
                      onChange={handleFormatChange}
                      className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="">Select target format</option>
                      {getTargetFormats(selectedFile.type).map(format => (
                        <option key={format} value={format}>
                          {format.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {conversionError && (
                    <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded-md">
                      {conversionError}
                    </div>
                  )}

                  <button
                    onClick={handleConvert}
                    disabled={!targetFormat || isConverting}
                    className={`w-full py-2 px-4 rounded-md transition-colors ${
                      !targetFormat || isConverting
                        ? "bg-gray-300 text-black cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {isConverting ? "Converting..." : "Convert File"}
                  </button>
                </>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">
                    Select a file to see conversion options
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            About File Conversion
          </h3>
          <div className="bg-white p-4 rounded-lg text-sm text-gray-600 shadow-sm">
            <p className="mb-2">
              Our file conversion tool allows you to convert files between
              various formats:
            </p>
            <ul className="list-disc pl-5 mb-2 space-y-1">
              <li>Convert images between JPG, PNG, WebP, and more</li>
              <li>Convert documents between PDF, DOC, and TXT formats</li>
              <li>Convert spreadsheets to CSV or PDF</li>
              <li>Convert presentations to PDF or image formats</li>
            </ul>
            <p>
              All conversions are processed securely and your files are never
              stored permanently.
            </p>
            <div className="security-note mt-8 p-4 bg-green-50 border border-green-200/80 rounded-lg">
              <p className="text-center font-medium m-2 p-2 text-purple-600/70">
                After conversion all the files will be displayed at Dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    );
    };

export default FileConverter;