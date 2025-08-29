# Project Summary

ConvertSign is a web application designed for users to effortlessly upload, resize, and convert files such as PDFs, documents, images, and photos. It also features digital signature creation and management of processed files through a user-friendly dashboard. Built with Next.js , TypeScript, Tailwind CSS, and Node.js, ConvertSign provides a robust solution for secure document management and file handling.

## Project Module Description

- **File Upload**: Users can upload files via drag-and-drop or file selection.
- **File Resizing**: Resize images while maintaining aspect ratios.
- **File Conversion**: Convert between various file formats (e.g., JPG, PNG, PDF).
- **Signature Creation**: Draw and customize digital signatures.
- **Dashboard**: Centralized view for managing uploaded and processed files.
- **Authentication**: Sign-in and sign-up functionality to secure user documents.

## Directory Tree

```bash
react_template/
├── README.md               # Project documentation
├── eslint.config.js        # ESLint configuration
├── index.html              # Main HTML file
├── package.json            # Project dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── public/
│   └── data/
│       └── example.json    # Example data for the application
├── src/
│   ├── App.jsx             # Main application component
│   ├── components/         # Contains all reusable components
│   │   ├── Dashboard.jsx    # Dashboard component
│   │   ├── FileConverter.jsx # File conversion component
│   │   ├── FileUploader.jsx  # File upload component
│   │   ├── Footer.jsx        # Footer component
│   │   ├── Header.jsx        # Header component
│   │   ├── ImageResizer.jsx  # Image resizing component
│   │   └── SignatureCanvas.jsx # Signature drawing component
│   ├── context/            # Context API for state management
│   │   └── FileContext.jsx  # File context for managing file states
│   ├── index.css           # Global CSS styles
│   ├── main.jsx            # Entry point for the React application
│   └── utils/              # Utility functions
│       └── fileUtils.js    # File utility functions
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.js          # Vite configuration
```

## File Description Inventory

- **README.md**: Contains project overview and instructions.
- **eslint.config.js**: Configuration file for ESLint to maintain code quality.
- **index.html**: Main HTML file that serves the React application.
- **package.json**: Lists project dependencies and scripts for building and running the application.
- **postcss.config.js**: Configuration for PostCSS.
- **public/data/example.json**: Sample data for application testing.
- **src/**: Contains the source code for the React application, including components, context, styles, and utilities.
- **tailwind.config.js**: Configuration file for Tailwind CSS.
- **vite.config.js**: Configuration file for Vite, a build tool.

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS , TypeScript
- **Backend**: Node.js , JavaScript
- **State Management**: React Context API


![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/Venomanas/ConvertSign?utm_source=oss&utm_medium=github&utm_campaign=Venomanas%2FConvertSign&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
