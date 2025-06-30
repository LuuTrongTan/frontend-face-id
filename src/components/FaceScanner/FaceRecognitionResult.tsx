import { useEffect, useState } from 'react';

interface Match {
  name: string;
  confidence: number;
  userId?: number;
}

interface FaceRecognitionResultProps {
  matches: Match[];
  imageSrc?: string;
}

const FaceRecognitionResult = ({ matches, imageSrc }: FaceRecognitionResultProps) => {
  const [topMatch, setTopMatch] = useState<Match | null>(null);
  
  useEffect(() => {
    // Tìm khuôn mặt phù hợp nhất (confidence cao nhất)
    if (matches && matches.length > 0) {
      const sorted = [...matches].sort((a, b) => b.confidence - a.confidence);
      setTopMatch(sorted[0]);
    } else {
      setTopMatch(null);
    }
  }, [matches]);
  
  if (!matches || matches.length === 0) {
    return (
      <div className="card">
        <p className="text-muted">Không tìm thấy khuôn mặt nào phù hợp.</p>
      </div>
    );
  }
  
  const getConfidenceClass = (confidence: number) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 70) return 'text-warning';
    return 'text-danger';
  };
  
  return (
    <div className="card">
      {topMatch && (
        <div className="match-result">
          <div className="top-match">
            <div className="match-avatar">
              {imageSrc && (
                <div className="avatar-container">
                  <img src={imageSrc} alt="Captured face" className="avatar-image" />
                </div>
              )}
            </div>
            <div className="match-info">
              <p className="match-name">{topMatch.name}</p>
              <p className={`match-confidence ${getConfidenceClass(topMatch.confidence)}`}>
                Độ chính xác: {topMatch.confidence.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}
      
      {matches.length > 1 && (
        <div className="other-matches">
          <h4 className="other-matches-title">Kết quả phù hợp khác</h4>
          <ul className="match-list">
            {matches.slice(1, 5).map((match, index) => (
              <li key={index} className="match-list-item">
                <div className="match-list-content">
                  <p className="match-list-name">{match.name}</p>
                  <p className={getConfidenceClass(match.confidence)}>
                    {match.confidence.toFixed(2)}%
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FaceRecognitionResult; 