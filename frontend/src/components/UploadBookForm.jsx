import React, { useState } from 'react';
import "../styles/UploadBookForm.css";

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