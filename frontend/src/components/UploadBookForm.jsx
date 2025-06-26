import React, { useState } from 'react';
import "../styles/UploadBookForm.css";
import axios from 'axios';

function UploadBookForm() {
    const [formData, setFormData] = useState({
            title: '',
            author: '',
            publicationDate: '',
            ISBN: '',
            genre: '',
            description: '',
            pdf: null
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'pdf') {
            setFormData({...formData, pdf: files[0]});
        } else {
            setFormData({ ...formData, [name]: value});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);
        data.append('author', formData.genre);
        data.append('publicationDate', formData.publicationDate);
        data.append('ISBN', formData.ISBN);
        data.append('description', formData.description);
        data.append('pdf', formData.pdf);

        try {
            const response = await axios.post('http://localhost:5000/books/upload', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
            });

            console.log('Upload success:', response.data);
        } catch (error) {
            console.error('Upload error:', error.response?.data || error.message);
        }
    };

    return (
        <div className="form-wrapper-container">
            <h3>Upload Book</h3>
            <form className="form-container" onSubmit={handleSubmit}>
                <input name="title" placeholder="Title" onChange={handleChange} />
                <input name="author" placeholder="Author" onChange={handleChange} />
                <input name="publicationDate" placeholder="YYYY-MM-DD" onChange={handleChange} />
                <input name="ISBN" placeholder="ISBN" onChange={handleChange} />
                <input name="genre" placeholder="Genre" onChange={handleChange} />
                <textarea name="description" placeholder="Description" onChange={handleChange}></textarea>
                <input type="file" name="pdf" accept="application/pdf" onChange={handleChange} />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default UploadBookForm;