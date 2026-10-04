import Loader from './Loader';

export default function LoadingState({ label = 'Loading' }) {
  return (
    <div className="panel flex min-h-48 items-center justify-center p-8">
      <Loader label={label} />
    </div>
  );
}
