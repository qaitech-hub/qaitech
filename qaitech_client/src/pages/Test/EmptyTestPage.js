import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EmptyTestPage = () => {
  const { workSpaceId } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/workspace/${workSpaceId}`);
  }, []);
};

export default EmptyTestPage;
