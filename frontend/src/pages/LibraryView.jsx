import UploadBookForm from "../components/UploadBookForm";
import "../styles/LibraryView.css";

function LibraryView() {
    return(
        <div>
            <h1>User Library</h1>
            <UploadBookForm />
        </div>
    )
}

export default LibraryView;